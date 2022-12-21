import cls from "classnames";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";
import InputSlider, { type RootProps } from "./InputSlider";

const requiredMockProps: RootProps = {
  label: { screenReaderLabel: "Infimum value" },
  min: 0,
  max: 100
};

const classNames: RootProps["classes"] = ({
  disabled,
  orientation,
  leadingThumbState,
  trailingThumbState
}) => ({
  root: cls("root", `root--${orientation}`, {
    "root--disabled": disabled
  }),
  range: "range",
  segment: "segment",
  segmentMark: "segment-mark",
  segmentLabel: "segment-label",
  segments: "segments",
  track: "track",
  thumb: "thumb",
  leadingThumb: cls("thumb--leading", {
    "thumb--active": leadingThumbState.active,
    "thumb--focus-visible": leadingThumbState.focusedVisible
  }),
  trailingThumb: cls("thumb--trailing", {
    "thumb--active": trailingThumbState.active,
    "thumb--focus-visible": trailingThumbState.focusedVisible
  })
});

describe("InputSlider", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(InputSlider, requiredMockProps);
  itSupportsStyle(InputSlider, requiredMockProps);
  itSupportsRef(InputSlider, requiredMockProps, HTMLDivElement);
  itSupportsDataSetProps(InputSlider, requiredMockProps);

  it("should have the required classNames", () => {
    render(
      <InputSlider
        {...requiredMockProps}
        data-testid="input-slider"
        classes={classNames}
        stops={[
          { label: "Step 0", value: 0 },
          { label: "Step 1", value: 15 },
          { label: "Step 2", value: 50 },
          { label: "Step 3", value: 85 },
          { label: "Step 4", value: 100 }
        ]}
        renderThumbValueText={(value, isOpen) => (
          <div className={cls("tooltip", { "tooltip--open": isOpen })}>
            {value.toFixed(1)}
          </div>
        )}
      />
    );

    const slider = screen.getByTestId("input-slider");
    const segments = slider.querySelector(".segments");
    const segment = slider.querySelector(".segment");
    const segmentMark = slider.querySelector(".segment-mark");
    const segmentLabel = slider.querySelector(".segment-label");
    const track = slider.querySelector(".track");
    const range = slider.querySelector(".range");
    const thumb = slider.querySelector(".thumb");
    const thumbTooltip = slider.querySelector(".tooltip");

    expect(slider).toHaveClass("root", "root--horizontal");
    expect(segments).toHaveClass("segments");
    expect(segment).toHaveClass("segment");
    expect(segmentMark).toHaveClass("segment-mark");
    expect(segmentLabel).toHaveClass("segment-label");
    expect(track).toHaveClass("track");
    expect(range).toHaveClass("range");
    expect(thumb).toHaveClass("thumb", "thumb--leading");
    expect(thumbTooltip).toHaveClass("tooltip");
  });

  it("should have the correct accessibility attributes", () => {
    render(
      <InputSlider
        {...requiredMockProps}
        data-testid="input-slider"
        classes={classNames}
        stops={[
          { label: "Step 0", value: 0 },
          { label: "Step 1", value: 15 },
          { label: "Step 2", value: 50 },
          { label: "Step 3", value: 85 },
          { label: "Step 4", value: 100 }
        ]}
        setThumbValueText={value => `${value.toFixed(1)} percent`}
      />
    );

    const slider = screen.getByTestId("input-slider");
    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    expect(slider).toHaveAttribute("aria-disabled", "false");

    const track = slider.querySelector(".track");
    expect(track).toHaveAttribute("aria-hidden", "true");

    const range = slider.querySelector(".range");
    expect(range).toHaveAttribute("aria-hidden", "true");

    const segments = slider.querySelector(".segments");
    expect(segments).toHaveAttribute("aria-hidden", "true");

    const thumb = slider.querySelector(".thumb");
    expect(thumb).toHaveAttribute("role", "slider");
    expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    expect(thumb).toHaveAttribute("aria-label", "Infimum value");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuetext", "0.0 percent");
  });

  it("changes `value` state with mouse/keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<
      void,
      Parameters<NonNullable<RootProps["onChange"]>>
    >();

    userEvent.setup();
    render(
      <InputSlider
        {...requiredMockProps}
        data-testid="input-slider"
        classes={classNames}
        onChange={handleChange}
        stops={[
          { label: "Step 0", value: 0 },
          { label: "Step 1", value: 15 },
          { label: "Step 2", value: 50 },
          { label: "Step 3", value: 85 },
          { label: "Step 4", value: 100 }
        ]}
        setThumbValueText={value => `${value.toFixed(1)} percent`}
      />
    );

    const slider = screen.getByTestId("input-slider");
    const thumb = screen.getByRole("slider");
    const segment = slider.querySelectorAll(".segment")[2];
    const segmentLabel = segment?.querySelector(".segment-label");

    expect(segmentLabel).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(segmentLabel!);

    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(50);

    await userEvent.keyboard("[Tab]");

    expect(thumb).toHaveFocus();

    await userEvent.keyboard("[ArrowRight]");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.[0]).toBe(51);
  });
});
