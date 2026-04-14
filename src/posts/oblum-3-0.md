---
title: Transforming CDC into Type 2 Slowly Changing Dimensions in dbt
slug: cdc-to-type2-scd
excerpt: Why and how to convert Change Data Capture (CDC) data into Type 2 Slowly Changing Dimensions (SCD) using dbt.
---

# Transforming [Change Data Capture (CDC)](https://en.wikipedia.org/wiki/Change_data_capture) into Type 2 SCD in [dbt](https://docs.getdbt.com/)

Change Data Capture (CDC) tracks every insert, update, and delete in a source system. It’s an excellent mechanism for *data movement* — keeping systems synchronized and detecting changes efficiently.

However, CDC streams are not designed for **analytical queries**. They tell you *what changed and when*, but not *what was valid at a given point in time*. For reporting and dimensional modeling, we often need a more structured history. That’s where **Type 2 Slowly Changing Dimensions (SCD2)** come in.

---

## Why transform CDC into Type 2 SCD?

CDC data is typically event-based rather than state-based. Consider a simple example of a `person` table replicated via CDC:

|  id | name  | cdc_operation | cdc_seq | row_valid_from |
| :-: | :---- | :------------ | :------ | :------------- |
|  1  | Alice | I             | 1       | 2022-01-01     |
|  1  | Alice | U             | 2       | 2022-06-01     |
|  1  | Alice | D             | 3       | 2023-01-01     |

While this shows that Alice was inserted, updated, and later deleted, it doesn’t define her **validity periods** in a way that can be queried historically.
By transforming this stream into a Type 2 SCD, we gain:

* **Historical tracking** — each change defines a valid time range (`row_valid_from` → `row_valid_to`)
* **Point-in-time analysis** — we can easily ask “what was true as of this date?”
* **Efficient incremental updates** — only rebuild entities that changed
* **Analytical clarity** — redundant or empty CDC delete events are excluded, since they hold no business content

---

This dbt macro converts CDC-formatted data into a Type 2 SCD table. It handles incremental loading, validity periods, and active flagging automatically.

```sql
{% macro sdp_cdc_to_type2(
    src_table,
    src_model,
    src_pk_cols
) %}

{% set unique_key_cols = src_pk_cols + ['cdc_seq'] %}

{{ config(
    materialized='incremental',
    incremental_strategy='merge',
    unique_key=unique_key_cols,
    on_schema_change='append_new_columns',
    file_format='delta'
) }}

{% set src_pk_cols_csv = src_pk_cols | join(', ') %}

with

{% if is_incremental() %}
affected_keys as (
    -- Identify keys that have changed since the last run
    select distinct {{ src_pk_cols_csv }} from {{ ref(src_model) }}
    where incremental_timestamp > nvl((select max(incremental_timestamp) from {{ this }}), '1900-01-01'::timestamp)
),
{% endif %}

events_to_rebuild as (
    -- Select relevant events to rebuild as Type 2
    select s.* except (s.row_processed_at)
    from {{ ref(src_model) }} as s
    {% if is_incremental() %}
    join affected_keys as ak
      on {% for key in src_pk_cols %}s.{{ key }} = ak.{{ key }}{% if not loop.last %} and {% endif %}{% endfor %}
    {% endif %}
),

calculated as (
    -- Define the validity ranges and identify deletions
    select
        *,
        lead(row_valid_from) over (
            partition by {{ src_pk_cols_csv }}
            order by cdc_seq
        ) as row_valid_to,
        max(case when cdc_operation = 'D' then row_valid_from end)
            over (partition by {{ src_pk_cols_csv }}) as row_deleted_at
    from events_to_rebuild
),

final as (
    -- Keep only meaningful records (ignore pure delete events)
    select
        *,
        case when row_valid_to is null then true else false end as is_active,
        current_timestamp() as row_processed_at
    from calculated
    where cdc_operation != 'D' or (row_deleted_at is not null and row_valid_from < row_deleted_at)
)

select * from final
{% endmacro %}
```
---

## How it works

1. **Detects affected entities**
   On incremental runs, it limits processing to only those primary keys that changed since the last timestamp.

2. **Builds validity ranges**
   Using `LEAD()`, the macro determines the `row_valid_to` timestamp — when the next change occurred for the same entity.

3. **Handles deletions gracefully**
   Since deleted rows often contain no meaningful business data, pure delete events are excluded.
   The final table will reflect that an entity’s history *ended* at the deletion timestamp, without storing an empty record.

4. **Flags active records**
   The most recent record for each entity is marked with `is_active = true`.

---

## Example result

|  id | name  | row_valid_from | row_valid_to | cdc_operation | is_active |
| :-: | :---- | :------------- | :----------- | :------------ | :-------- |
|  1  | Alice | 2022-01-01     | 2022-06-01   | I             | false     |
|  1  | Alice | 2022-06-01     | 2023-01-01   | U             | false     |

After Alice’s deletion event, the final record simply ends at `2023-01-01`, and no delete row is kept — reflecting that she was removed but without introducing an empty record.

Now you can easily query her historical state:

```sql
select *
from {{ ref('dim_person') }}
where '2022-07-01' between row_valid_from and coalesce(row_valid_to, '9999-12-31')
```

---

CDC tells us *what changed* — SCD2 tells us *what was true and when*.
By transforming CDC streams into Type 2 Slowly Changing Dimensions in dbt, we gain a reliable and queryable history of our data.

* Maintains complete validity periods
* Excludes deletion events that carry no content
* Enables time-based and point-in-time analytics
* Integrates seamlessly into incremental dbt models

The `sdp_cdc_to_type2` macro brings clarity, structure, and efficiency to CDC-driven data pipelines — turning streams of change into meaningful analytical history.
