"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { increment, decrement, reset } from "@/features/counter/counterSlice";
import { Button } from "@/components/ui/button"; // pakai button buatan kamu, atau ganti jadi <button> biasa

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <h1 className="text-2xl font-bold">Count: {count}</h1>
      <div className="flex gap-4">
        <Button onClick={() => dispatch(increment())}>Increment</Button>
        <Button onClick={() => dispatch(decrement())}>Decrement</Button>
        <Button variant="outline" onClick={() => dispatch(reset())}>Reset</Button>
      </div>
    </div>
  );
}
