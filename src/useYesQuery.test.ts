import { act, renderHook, waitFor } from "@testing-library/react";
import { useYesQuery } from "./useYesQuery";

describe(useYesQuery.name, () => {
  it("begins loading data on mount", async () => {
    // given
    const queryFn = jest.fn().mockResolvedValue("abc");

    // when
    const { result } = renderHook(() => useYesQuery({ queryFn }));

    // then - starts empty
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    // then - eventually resolves
    await waitFor(() => expect(result.current.data).toEqual("abc"));
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeUndefined();
  });

  it("presents an error if one occurred", async () => {
    // given
    const queryFn = jest.fn().mockRejectedValue(new Error("unauthorized"));

    // when
    const { result } = renderHook(() => useYesQuery({ queryFn }));

    // then - starts empty
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    // then - eventually resolves
    await waitFor(() => expect(result.current.error).toEqual(new Error("unauthorized")));
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBeUndefined();
  });

  it("reloads", async () => {
    // given
    const queryFn = jest.fn().mockResolvedValue("abc");
    const { result } = renderHook(() => useYesQuery({ queryFn }));
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));

    // when
    await act(() => result.current.reload());

    // then
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
  });

  describe("supports imperative APIs", () => {
    it("when getting/setting data", async () => {
      // given
      const queryFn = jest.fn().mockResolvedValue("abc");
      const { result } = renderHook(() => useYesQuery({ queryFn }));
      await waitFor(() => expect(result.current.data).toEqual("abc"));

      // when - capture the synchronous snapshot before the re-render commits
      let reactiveDataDuringSet: unknown;
      let imperativeDataDuringSet: unknown;
      act(() => {
        result.current.setData("xyz");
        reactiveDataDuringSet = result.current.data;
        imperativeDataDuringSet = result.current.getData();
      });

      // then - old reactive value was still present at set time
      expect(reactiveDataDuringSet).toEqual("abc");
      // then - new value was immediately available via getter
      expect(imperativeDataDuringSet).toEqual("xyz");
      // then - new reactive value becomes available after the flush
      await waitFor(() => expect(result.current.data).toEqual("xyz"));
      // then - queryFn has only been called once
      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    });

    it("when getting/setting errors", async () => {
      // given
      const queryFn = jest.fn().mockRejectedValue(new Error("unauthorized"));
      const { result } = renderHook(() => useYesQuery({ queryFn }));
      await waitFor(() => expect(result.current.error).toEqual(new Error("unauthorized")));

      // when - capture the synchronous snapshot before the re-render commits
      let reactiveErrorDuringSet: unknown;
      let imperativeErrorDuringSet: unknown;
      act(() => {
        result.current.setError(new Error("forbidden"));
        reactiveErrorDuringSet = result.current.error;
        imperativeErrorDuringSet = result.current.getError();
      });

      // then - old reactive value was still present at set time
      expect(reactiveErrorDuringSet).toEqual(new Error("unauthorized"));
      // then - new value was immediately available via getter
      expect(imperativeErrorDuringSet).toEqual(new Error("forbidden"));
      // then - new reactive value becomes available after the flush
      await waitFor(() => expect(result.current.error).toEqual(new Error("forbidden")));
      // then - queryFn has only been called once
      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    });
  });
});
