/* eslint-disable tailwindcss/no-custom-classname */
import { createEffect, createMemo, createSignal } from "solid-js";

// import "./multiRangeSlider.css";
type Props = {
  min: number;
  max: number;
  onChange: Function;
};
export const MultiRangeSlider = ({ min, max, onChange }: Props) => {
  const [minVal, setMinVal] = createSignal(min);
  const [maxVal, setMaxVal] = createSignal(max);
  // const minValRef = useRef(min);
  // const maxValRef = useRef(max);
  // const range = useRef(null);
  let minValRef = 0;
  let maxValRef = 0;
  let range;
  console.log(minVal(), "minVal()");
  console.log(maxVal(), "maxVal()");
  console.log(minValRef, "minValRef");
  console.log(maxValRef, "maxValRef");
  console.log(range, "range");
  // console.log()
  // Convert to percentage
  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);
  // [min, max]

  console.log(getPercent(10), "getPercent(10)");

  // Set width of the range to decrease from the left side
  createEffect(() => {
    const minPercent = getPercent(minVal());
    const maxPercent = getPercent(maxValRef);

    if (range) {
      range.style.left = `${minPercent}%`;
      range.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal(), getPercent]);

  // Set width of the range to decrease from the right side
  createEffect(() => {
    const minPercent = getPercent(minValRef);
    const maxPercent = getPercent(maxVal());

    if (range) {
      range.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal(), getPercent]);

  // Get min and max values when their state changes
  createEffect(() => {
    onChange({ min: minVal(), max: maxVal() });
  }, [minVal(), maxVal(), onChange]);

  return (
    <div class="container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal()}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal() - 1);
          setMinVal(value);
          minValRef = value;
        }}
        class="thumb thumb--left"
        style={{ zIndex: minVal() > max - 100 && "5" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal()}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal() + 1);
          setMaxVal(value);
          maxValRef = value;
        }}
        class="thumb thumb--right"
      />

      <div class="slider">
        <div class="slider__track" />
        <div ref={range} class="slider__range" />
        <div class="slider__left-value">
          <input
            value={minVal()}
            min={min}
            max={max}
            style={{ width: "40px", height: "25px", marginLeft: "-10px" }}
            onChange={(e) => {
              setMinVal(e.target.value);
            }}
          />
        </div>
        <div class="slider__right-value">
          <input
            value={maxVal()}
            min={min - 1}
            max={max}
            style={{ width: "40px", height: "25px", marginLeft: "-10px" }}
            onChange={(e) => {
              setMaxVal(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MultiRangeSlider;
