---
title: Compressing snapshots in dbt
slug: oblum-2-0
excerpt: Strategy and macro for compressing snapshot timestamps in dbt
---

# Compressing [snapshot](https://docs.getdbt.com/docs/build/snapshots) timestamps in [dbt](https://docs.getdbt.com/docs/build/documentation)

Whether you are snapshotting your source data (recommended), or any model further downstream, a best practice (as recommended by dbt labs) is to track the history of the entire source table ( select * ). The risk of not doing that, is that once you exclude a column, its history is not tracked and cannot be built retrospectively, while someone may be interested in it in the future.

Now that you are tracking history of columns that are not used anywhere downstream, you may end up with duplicates.
Imagine you are snapshotting an employee table, and Alice's history looks like this:

<table>
  <tr>
    <th>ID</th>
    <th>Name</th>
    <th>Function</th>
    <th>Children</th>
    <th>Valid From</th>
    <th>Valid To</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Alice</td>
    <td>Engineer</td>
    <td>1</td>
    <td>2022-01-01</td>
    <td>2022-05-31</td>
  </tr>
  <tr>
    <td>1</td>
    <td>Alice</td>
    <td>Architect</td>
    <td>1</td>
    <td>2022-05-31</td>
    <td>2023-09-14</td>
  </tr>
  <tr>
    <td>1</td>
    <td>Alice</td>
    <td>Architect</td>
    <td>2</td>
    <td>2023-09-14</td>
    <td>9999-01-31</td>
  </tr>
</table>


In one a model downstream from it, you are no longer interested in the number of children. Selecting only Name and Function, you would end up with:

| ID | Name  | Function  | Valid From | Valid To   |
|:--:|:-----:|:---------:|:----------:|:----------:|
|1   | Alice | Engineer  | 2022-01-01 | 2022-05-31 |
|1   | Alice | Architect | 2022-05-31 | 2023-09-14 |
|1   | Alice | Architect | 2023-09-14 | 9999-01-31 |

Alice was promoted to Architect on 2022-05-31, but since she gave birth to a second child on 2023-09-14, you now have a duplicate record.

Ideally, you would want to compress this result in order to produce:

| ID | Name  | Function  | Valid From | Valid To   |
|:--:|:-----:|:---------:|:----------:|:----------:|
|1   | Alice | Engineer  | 2022-01-01 | 2022-05-31 |
|1   | Alice | Architect | 2022-05-31 | 9999-01-31 |

Given a CTE (a source table), the source table's ID column, and the subset of columns you would like to retain (Name and Function in this case), the following macro will do just that, by first creating "compression groups" and using them to compress the timestamps.

| ID | Name  | Function  | Valid From | Valid To   | Compression Group |
|:--:|:-----:|:---------:|:----------:|:----------:|:-----------------:|
|1   | Alice | Engineer  | 2022-01-01 | 2022-05-31 |0                  |
|1   | Alice | Architect | 2022-05-31 | 2023-09-14 |1                  |
|1   | Alice | Architect | 2023-09-14 | 9999-01-31 |1                  |

You may think that grouping by the ID, Name and Function should be enough, and in the above example it also would be enough, but what if Alice wanted to be an engineer again? The timestamps would be wrong without a compression group.

The code is also available on [Github](https://github.com/ofirblum/dbt-macros/blob/main/compress_snapshot.sql)

```sql
{% macro compress_snapshot(cte, id_col, subset_cols) %}
/*
This macro takes a snapshot which tracks changes to all source columns,
and compresses its timestamps based on a subset of columns that we would like to retain in staging.
*/

-- Subset of columns to include in subsequent queries
{% set subset_cols_str = subset_cols | join(', ') %}

-- If there is just 1 column, we don't concatenate, only cast to string.
{% if subset_cols | length == 1 %}
    {% set change_detection_cols =
        "coalesce(cast(" ~ subset_cols[0] ~ " as " ~ dbt.type_string() ~ "), '')"
    %}
-- Otherwise, we concatenate all change detection columns in order to use 1 single lag function.
{% else %}
    {% set lag_cols = [] %}
    {% for col in subset_cols %}
        {% do lag_cols.append(
            "coalesce(cast(" ~ col ~ " as " ~ dbt.type_string() ~ "), '')"
        ) %}
        {%- if not loop.last %}
        {%- do lag_cols.append("'-'") -%}
        {%- endif -%}
    {% endfor %}
    {% set change_detection_cols = dbt.concat(lag_cols) %}
{% endif %}

/*
Now we compare all subset columns with their previous version by ID.
The sum function will increase with every change, creating groups of integers.
*/
change_detection as (
    select
        {{ id_col }},
        {{ subset_cols_str }},
        sum(
            case
                when
                    {{ change_detection_cols }}
                    <>
                    lag({{ change_detection_cols }} ) over (partition by {{ id_col }} order by row_valid_from)
                    then 1
                else 0
            end
        ) over (partition by {{id_col}} order by row_valid_from) as compression_group,
        {{ get_audit_columns() }}
    from {{ cte }}
),

-- Compressing the date columns, grouping by the row groups we created.
compressed_snapshot as (
    select
        {{ id_col }},
        {{ subset_cols_str }},
        min(row_valid_from) as row_valid_from,
        max(row_valid_to) as row_valid_to,
        max(row_scd_id) as row_scd_id,
        min(row_updated_at) as row_updated_at,
        min(incremental_timestamp) as incremental_timestamp,
        max(row_processed_at) as row_processed_at,
    from change_detection
    group by
        {{ id_col }},
        {{ subset_cols_str }},
        compression_group
),

--Adding a PK with the compressed row_updated_at
{% set pk_col_name = 'pk_' ~ id_col | replace('_id', '') %}
final as (
    select
        {{ dbt_utils.generate_surrogate_key([id_col,'row_updated_at']) }} as {{pk_col_name}}
        ,{{ id_col }}
        ,{{ subset_cols_str }}
        ,{{ get_audit_columns() }}
    from compressed_snapshot
)

select * from final
where {{ get_default_incremental_predicate() }}

{% endmacro %}
```
