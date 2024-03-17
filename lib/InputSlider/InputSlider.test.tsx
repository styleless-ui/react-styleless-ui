import cls from "classnames";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import InputSlider, { type Props } from "./InputSlider";

const requiredMockProps: Props = {
  multiThumb: false,
  label: { screenReaderLabel: "Infimum value" },
  min: 0,
  max: 100,
  setThumbValueText: v => String(v),
};

const classNames: Props["classes"] = ({
  disabled,
  orientation,
  infimumThumbState,
  supremumThumbState,
}) => ({
  root: cls("root", `root--${orientation}`, {
    "root--disabled": disabled,
  }),
  range: "range",
  segment: "segment",
  segmentMark: "segment-mark",
  segmentLabel: "segment-label",
  segments: "segments",
  track: "track",
  thumb: "thumb",
  infimumThumb: cls("thumb--infimum", {
    "thumb--active": infimumThumbState.active,
    "thumb--focus-visible": infimumThumbState.focusedVisible,
  }),
  supremumThumb: cls("thumb--supremum", {
    "thumb--active": supremumThumbState.active,
    "thumb--focus-visible": supremumThumbState.focusedVisible,
  }),
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
          { label: "Step 4", value: 100 },
        ]}
        renderThumbValueText={(value, isOpen) => (
          <div className={cls("tooltip", { "tooltip--open": isOpen })}>
            {value.toFixed(1)}
          </div>
        )}
      />,
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
    expect(thumb).toHaveClass("thumb", "thumb--supremum");
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
          { label: "Step 4", value: 100 },
        ]}
        setThumbValueText={value => `${value.toFixed(1)} percent`}
      />,
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
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuetext", "100.0 percent");
  });

  it("changes `value` state with mouse/keyboard interactions and calls `onValueChange` callback", async () => {
    const handleValueChange = jest.fn<
      void,
      Parameters<NonNullable<Props["onValueChange"]>>
    >();

    userEvent.setup();
    render(
      <InputSlider
        {...requiredMockProps}
        data-testid="input-slider"
        classes={classNames}
        onValueChange={handleValueChange}
        stops={[
          { label: "Step 0", value: 0 },
          { label: "Step 1", value: 15 },
          { label: "Step 2", value: 50 },
          { label: "Step 3", value: 85 },
          { label: "Step 4", value: 100 },
        ]}
        setThumbValueText={value => `${value.toFixed(1)} percent`}
      />,
    );

    const slider = screen.getByTestId("input-slider");
    const thumb = screen.getByRole("slider");
    const segment = slider.querySelectorAll(".segment")[2];
    const segmentLabel = segment?.querySelector(".segment-label");

    expect(segmentLabel).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(segmentLabel!);

    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(50);

    await userEvent.keyboard("[Tab]");

    expect(thumb).toHaveFocus();

    await userEvent.keyboard("[ArrowRight]");
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe(51);
  });
});
