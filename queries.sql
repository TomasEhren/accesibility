create or replace table `cartodb-gcp-solutions-eng-team.accesibility.valencia_roads` cluster by (geom) as 
SELECT 
    c.osm_id,
    c.geometry as geom,
    value as highway
FROM `bigquery-public-data.geo_openstreetmap.planet_features` c, unnest(all_tags) t
where feature_type = 'lines'
and (key = 'highway' and value in ('primary', 'secondary', 'tertiary', 'residential', 'motorway', 'cycleway'))
AND st_intersects(st_buffer(st_geogpoint(-0.380, 39.468), 30000), c.geometry)
;

create or replace table  `cartodb-gcp-solutions-eng-team.accesibility.valencia_roads_nodes` cluster by(geom) as
select row_number() over() as _id,  any_value(geom) as geom from (
  select osm_id, 'start' as type, st_pointn(geom, 1) as geom
  from cartodb-gcp-solutions-eng-team.accesibility.valencia_roads
  union all 
  select osm_id, 'end' as type, st_pointn(geom, st_npoints(geom)) as geom
  from cartodb-gcp-solutions-eng-team.accesibility.valencia_roads
)
group by st_astext(geom)
;

create or replace table `cartodb-gcp-solutions-eng-team.accesibility.cycling_with_timestamp` as 
select 
  row_number() over() as row_id,
  cast(_range / 60 as int) as travelled_minutes,
  timestamp_add(timestamp('2023-06-15T12:00:00Z'), interval cast(_range/60 as int) minute) AS datetime,
  st_union_agg(case when mode = 'cycling' then p.geom end) as cycling,
  st_union_agg(case when mode = 'public_transport' then p.geom end) as public_transport,
  st_union_agg(case when mode = 'driving' then p.geom end) as geom
from `cartodb-gcp-solutions-eng-team.accesibility.isolines` i
join `cartodb-gcp-solutions-eng-team.accesibility.valencia_roads_nodes` p
on st_intersects(i.geom, p.geom)
where _range <= 60*30
group by _range
;

create or replace table `cartodb-gcp-solutions-eng-team.accesibility.fireworks` cluster by(geom) as 
select 
  row_number() over() as row_id,
  mode,
  cast(_range / 60 as int) as travelled_minutes,
  timestamp_add(timestamp('2023-06-15T12:00:00Z'), interval cast(_range/60 as int) minute) AS datetime,
  st_intersection(st_boundary(i.geom), r.geom) as geom
from `cartodb-gcp-solutions-eng-team.accesibility.isolines` i
join `cartodb-gcp-solutions-eng-team.accesibility.valencia_roads` r --_nodes
on st_distance(st_boundary(i.geom), r.geom) < 100
where _range < 30*60
and not st_isempty(st_intersection(st_boundary(i.geom), r.geom))



