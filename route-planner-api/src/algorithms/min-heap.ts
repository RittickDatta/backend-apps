
export interface HeapItem<T> {
  value: T;
  priority: number;
}

export class MinHeap<T> {
  private readonly items: HeapItem<T>[] = [];

  get size(): number {
    return this.items.length;
  }

  push(value: T, priority: number): void {
    if (!Number.isFinite(priority)) {
      throw new Error("Heap priority must be finite");
    }

    this.items.push({ value, priority });
    this.bubbleUp(this.items.length - 1);
  }

  pop(): HeapItem<T> | null {
    if (this.items.length === 0) {
      return null;
    }

    const min = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (
        this.items[parent].priority <=
        this.items[index].priority
      ) {
        break;
      }

      this.swap(parent, index);
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.items.length;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (
        left < length &&
        this.items[left].priority <
          this.items[smallest].priority
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.items[right].priority <
          this.items[smallest].priority
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [
      this.items[b],
      this.items[a],
    ];
  }
}
