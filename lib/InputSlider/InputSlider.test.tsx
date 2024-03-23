import classNames from "classnames";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import * as InputSlider from "./index";

const requiredMockProps: InputSlider.RootProps = {
  multiThumb: false,
  min: 0,
  max: 100,
  orientation: "horizontal",
  setThumbValueText: v => String(v),
};

describe("InputSlider", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(InputSlider.Root, requiredMockProps);
  itSupportsStyle(InputSlider.Root, requiredMockProps);
  itSupportsRef(InputSlider.Root, requiredMockProps, HTMLDivElement);
  itSupportsDataSetProps(InputSlider.Root, requiredMockProps);

  it("should have the required classNames", () => {
    render(
      <InputSlider.Root
        multiThumb={true}
        max={100}
        min={0}
        disabled
        readOnly
        setThumbValueText={v => String(v)}
        orientation="vertical"
        data-testid="root"
        className={({ disabled, dragging, orientation, readOnly }) =>
          classNames("root", `root--${orientation}`, {
            "root--disabled": disabled,
            "root--readonly": readOnly,
            "root--dragging": dragging,
          })
        }
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum slider" }}
          className={({ focusedVisible }) =>
            classNames("thumb", "thumb--infimum", {
              "thumb--focus-visible": focusedVisible,
            })
          }
        ></InputSlider.InfimumThumb>
        <InputSlider.Track
          data-testid="track"
          className="track"
        >
          <InputSlider.Range
            data-testid="range"
            className="range"
          />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum slider" }}
          autoFocus
          className={({ focusedVisible }) =>
            classNames("thumb", "thumb--supremum", {
              "thumb--focus-visible": focusedVisible,
            })
          }
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    const root = screen.getByTestId("root");
    const track = screen.getByTestId("track");
    const range = screen.getByTestId("range");
    const thumbs = screen.getAllByRole("slider");

    expect(root).toHaveClass(
      "root",
      "root--disabled",
      "root--readonly",
      "root--disabled",
      "root--vertical",
    );
    expect(track).toHaveClass("track");
    expect(range).toHaveClass("range");
    expect(thumbs[0]).toHaveClass("thumb", "thumb--infimum");
    expect(thumbs[1]).toHaveClass("thumb", "thumb--supremum");
  });

  it("should have the correct accessibility attributes", () => {
    render(
      <InputSlider.Root
        multiThumb={false}
        max={100}
        min={0}
        disabled
        readOnly
        setThumbValueText={v => String(v)}
        orientation="horizontal"
        data-testid="root"
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum slider" }}
        ></InputSlider.InfimumThumb>
        <InputSlider.Track data-testid="track">
          <InputSlider.Range data-testid="range" />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum slider" }}
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    const root = screen.getByTestId("root");
    const track = screen.getByTestId("track");
    const range = screen.getByTestId("range");
    const thumbs = screen.getAllByRole("slider");

    expect(root).toHaveAttribute("aria-orientation", "horizontal");
    expect(track).toHaveAttribute("aria-hidden", "true");
    expect(range).toHaveAttribute("aria-hidden", "true");

    expect(thumbs.length).toBe(1);
    expect(thumbs[0]).toHaveAttribute("role", "slider");
    expect(thumbs[0]).toHaveAttribute("aria-orientation", "horizontal");
    expect(thumbs[0]).toHaveAttribute("aria-label", "Supremum slider");
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "100");
    expect(thumbs[0]).toHaveAttribute("aria-valuemin", "0");
    expect(thumbs[0]).toHaveAttribute("aria-valuemax", "100");
    expect(thumbs[0]).toHaveAttribute("aria-valuetext", "100");
    expect(thumbs[0]).toHaveAttribute("aria-readonly", "true");
    expect(thumbs[0]).toHaveAttribute("aria-disabled", "true");
  });

  it("changes `value` state with mouse/keyboard interactions and calls `onValueChange` callback", async () => {
    const handleValueChange = jest.fn<
      void,
      Parameters<NonNullable<InputSlider.RootProps["onValueChange"]>>
    >();

    const getSupThumb = () => screen.getByRole("slider", { name: "Supremum" });
    const getInfThumb = () => screen.getByRole("slider", { name: "Infimum" });

    userEvent.setup();
    const { unmount: unmount1 } = render(
      <InputSlider.Root
        multiThumb={false}
        max={100}
        min={0}
        readOnly
        setThumbValueText={v => String(v)}
        orientation="horizontal"
        data-testid="root"
        onValueChange={handleValueChange}
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum" }}
        ></InputSlider.InfimumThumb>
        <InputSlider.Track data-testid="track">
          <InputSlider.Range data-testid="range" />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum" }}
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    await userEvent.tab();

    expect(getSupThumb()).toHaveFocus();

    await userEvent.keyboard("[ArrowDown]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "100");
    expect(handleValueChange.mock.calls.length).toBe(0);

    handleValueChange.mockReset();
    unmount1();
    const { unmount: unmount2 } = render(
      <InputSlider.Root
        multiThumb={false}
        max={100}
        min={0}
        disabled
        setThumbValueText={v => String(v)}
        orientation="horizontal"
        data-testid="root"
        onValueChange={handleValueChange}
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum" }}
        ></InputSlider.InfimumThumb>
        <InputSlider.Track data-testid="track">
          <InputSlider.Range data-testid="range" />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum" }}
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    await userEvent.tab();

    expect(getSupThumb()).not.toHaveFocus();

    handleValueChange.mockReset();
    unmount2();
    const { unmount: unmount3 } = render(
      <InputSlider.Root
        multiThumb={false}
        max={100}
        min={0}
        setThumbValueText={v => String(v)}
        orientation="horizontal"
        data-testid="root"
        onValueChange={handleValueChange}
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum" }}
        ></InputSlider.InfimumThumb>
        <InputSlider.Track data-testid="track">
          <InputSlider.Range data-testid="range" />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum" }}
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    await userEvent.tab();

    expect(getSupThumb()).toHaveFocus();

    await userEvent.keyboard("[Home]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "0");
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(0);

    await userEvent.keyboard("[End]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "100");
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe(100);

    await userEvent.keyboard("[ArrowDown]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "99");
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.[0]).toBe(99);

    await userEvent.keyboard("[ArrowLeft]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "98");
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.[0]).toBe(98);

    await userEvent.keyboard("[ArrowRight]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "99");
    expect(handleValueChange.mock.calls.length).toBe(5);
    expect(handleValueChange.mock.calls[4]?.[0]).toBe(99);

    await userEvent.keyboard("[ArrowUp]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "100");
    expect(handleValueChange.mock.calls.length).toBe(6);
    expect(handleValueChange.mock.calls[5]?.[0]).toBe(100);

    handleValueChange.mockReset();
    unmount3();
    render(
      <InputSlider.Root
        multiThumb={true}
        max={100}
        min={0}
        step={10}
        setThumbValueText={v => String(v)}
        orientation="horizontal"
        data-testid="root"
        onValueChange={handleValueChange}
      >
        <InputSlider.InfimumThumb
          label={{ screenReaderLabel: "Infimum" }}
        ></InputSlider.InfimumThumb>
        <InputSlider.Track data-testid="track">
          <InputSlider.Range data-testid="range" />
        </InputSlider.Track>
        <InputSlider.SupremumThumb
          label={{ screenReaderLabel: "Supremum" }}
        ></InputSlider.SupremumThumb>
      </InputSlider.Root>,
    );

    await userEvent.tab();

    expect(getInfThumb()).toHaveFocus();

    await userEvent.keyboard("[End]");

    expect(getInfThumb()).toHaveAttribute("aria-valuenow", "100");
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toEqual([100, 100]);

    await userEvent.keyboard("[Home]");

    expect(getInfThumb()).toHaveAttribute("aria-valuenow", "0");
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toEqual([0, 100]);

    await userEvent.keyboard("[ArrowUp]");

    expect(getInfThumb()).toHaveAttribute("aria-valuenow", "10");
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.[0]).toEqual([10, 100]);

    await userEvent.tab();

    expect(getSupThumb()).toHaveFocus();

    await userEvent.keyboard("[Home]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "10");
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.[0]).toEqual([10, 10]);

    await userEvent.keyboard("[ArrowRight]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "20");
    expect(handleValueChange.mock.calls.length).toBe(5);
    expect(handleValueChange.mock.calls[4]?.[0]).toEqual([10, 20]);

    await userEvent.tab({ shift: true });

    expect(getInfThumb()).toHaveFocus();

    await userEvent.keyboard("[End]");

    expect(getSupThumb()).toHaveAttribute("aria-valuenow", "20");
    expect(handleValueChange.mock.calls.length).toBe(6);
    expect(handleValueChange.mock.calls[5]?.[0]).toEqual([20, 20]);
  });
});
