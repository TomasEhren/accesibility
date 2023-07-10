declare i int64 default 0;
declare app_id string default '02974100';
declare apikey string default 'ad6a6e483dfb044ec41c2ca39e5e681e';
declare lat string default '39.468';
declare lng string default '-0.38';
declare modes array<string> default ['public_transport', 'driving', 'cycling'];
declare url string default 'https://api.traveltimeapp.com/v4/time-map?type=%s&travel_time=%s&lat=%s&lng=%s&departure_time=2023-06-15T12:00:00Z&app_id=%s&api_key=%s';
 

create or replace table `cartodb-gcp-solutions-eng-team.accesibility.responses`(
  _mode string,
  _range int64,
  geom geography
);


create temp table `urls` as (
  select 
    row_number() over() as rn,
    m as _mode, 
    r as _range,
    format(url, m, cast(r as string), lat, lng, app_id, apikey) as url
  from unnest(generate_array(60, 600, 60)) r
  cross join unnest(modes) m
);

create temp function get_poly(response string) 
  returns geography as ((
   with lines as (
    select st_makeline(array_agg(
      st_geogpoint(
        cast(json_value(p.lng) as float64), 
        cast(json_value(p.lat) as float64)
      )
    )) as line  
  from unnest(json_extract_array(parse_json(response, wide_number_mode=>'round').results[0].shapes)) s
  cross join unnest(json_extract_array(s.shell)) p
  group by to_json_string(s)
  )
    select st_union_agg(line) from lines
))
;

loop 
  execute immediate(
    format(
      '''
      insert into cartodb-gcp-solutions-eng-team.accesibility.responses(_mode, _range, geom)
        select 
          _mode,
          _range,
          get_poly(bigfunctions.us.get(url, null)) as geom
        from `urls` 
        where rn >= %s
        and rn < %s + 5
      ''', 
      cast(i as string),  -- current i
      cast(i as string) -- current i
    )
  );
  set i = i + 5;
  
  if i > (select max(rn) from `urls`) then 
    leave; 
  end if;
end loop;
