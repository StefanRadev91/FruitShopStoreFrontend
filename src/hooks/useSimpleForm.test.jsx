import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSimpleForm } from "./useSimpleForm";

const setup = () =>
  renderHook(() =>
    useSimpleForm({
      initialValues: { name: "", phone: "" },
      validate: {
        name: (v) => (v.length < 2 ? "кратко име" : null),
        phone: (v) => (/^\d+$/.test(v) ? null : "невалиден телефон"),
      },
    })
  );

describe("useSimpleForm", () => {
  it("започва с началните стойности", () => {
    const { result } = setup();
    expect(result.current.values).toEqual({ name: "", phone: "" });
    expect(result.current.getInputProps("name")).toMatchObject({ value: "", error: undefined });
  });

  it("onChange приема и събитие, и стойност", () => {
    const { result } = setup();
    act(() => result.current.getInputProps("name").onChange({ currentTarget: { value: "Иван" } }));
    expect(result.current.values.name).toBe("Иван");
    act(() => result.current.getInputProps("phone").onChange("0888"));
    expect(result.current.values.phone).toBe("0888");
  });

  it("validate връща hasErrors и показва грешките по полета", () => {
    const { result } = setup();
    let out;
    act(() => {
      out = result.current.validate();
    });
    expect(out.hasErrors).toBe(true);
    expect(result.current.getInputProps("name").error).toBe("кратко име");
    expect(result.current.getInputProps("phone").error).toBe("невалиден телефон");
  });

  it("грешката на поле изчезва при писане, другите остават", () => {
    const { result } = setup();
    act(() => {
      result.current.validate();
    });
    act(() => result.current.getInputProps("name").onChange("Иван"));
    expect(result.current.getInputProps("name").error).toBeUndefined();
    expect(result.current.getInputProps("phone").error).toBe("невалиден телефон");
  });

  it("валидна форма няма грешки", () => {
    const { result } = setup();
    act(() => result.current.setValues({ name: "Иван", phone: "0888" }));
    let out;
    act(() => {
      out = result.current.validate();
    });
    expect(out.hasErrors).toBe(false);
  });

  it("setValues слива частични стойности (като @mantine/form)", () => {
    const { result } = setup();
    act(() => result.current.setValues({ name: "А" }));
    act(() => result.current.setValues({ phone: "1" }));
    expect(result.current.values).toEqual({ name: "А", phone: "1" });
  });
});
