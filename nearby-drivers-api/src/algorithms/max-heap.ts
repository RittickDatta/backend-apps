
export class MaxHeap<T> {
  private items: T[] = [];

  constructor(
    private readonly compare: (a: T, b: T) => number
  ) {}

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }

    const root = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return root;
  }

  toArray(): T[] {
    return [...this.items];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (
        this.compare(
          this.items[index],
          this.items[parent]
        ) <= 0
      ) {
        break;
      }

      this.swap(index, parent);
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.items.length;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let largest = index;

      if (
        left < length &&
        this.compare(
          this.items[left],
          this.items[largest]
        ) > 0
      ) {
        largest = left;
      }

      if (
        right < length &&
        this.compare(
          this.items[right],
          this.items[largest]
        ) > 0
      ) {
        largest = right;
      }

      if (largest === index) break;

      this.swap(index, largest);
      index = largest;
    }
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [
      this.items[b],
      this.items[a],
    ];
  }
}
