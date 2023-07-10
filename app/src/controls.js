import React from "react";
import { Select } from "baseui/select";
import { Block } from "baseui/block";
import { FormControl } from "baseui/form-control";
// import { Slider } from "baseui/slider";
import Slider from "@mui/material/Slider";

const cities = [{ value: "buenos-aires", label: "Buenos Aires" }];
/*
const old_slider = (
  <Slider
    min={5}
    max={60}
    step={5}
    value={[minutes]}
    onChange={({ value }) => {
      setMinutes(Number(value));
      console.log(value);
    }}
    onFinalChange={(e) => console.log(e)}
  />
);
*/
const valuetext = (value) => {
  return `${value}°C`;
};
const Controls = ({ city, minutes, setMinutes, setCity }) => (
  <Block
    className="controls"
    style={{
      position: "fixed",
      top: 20,
      left: 20,
      padding: 20,
      width: "200px",
      backgroundColor: "white",
      border: `1px solid #eee`,
    }}
  >
    <FormControl label="City">
      <Select
        value={[cities.find((d) => d.value === city)]}
        clearable={false}
        options={cities}
        labelKey="label"
        valueKey="value"
        onChange={({ value }) => {
          setCity(value[0].value);
        }}
      />
    </FormControl>

    <FormControl label="Travelled Minutes">
      <Slider
        aria-label="Temperature"
        defaultValue={minutes}
        valueLabelDisplay="auto"
        onChangeCommitted={(info, value) => {
          console.log(value);
        }}
        step={5}
        marks
        min={5}
        max={60}
      />
    </FormControl>
  </Block>
);

export default Controls;
