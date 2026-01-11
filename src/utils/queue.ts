export class Queue {
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    run: () => Promise<any>;
  }> = [];
  private running: boolean = false;

  enqueue(job: any) {
    this.queue.push(job);
  }

  dequeue() {
    return this.queue.shift();
  }

  async add(task: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      const queue = {
        resolve,
        reject,
        run: task,
      };
      this.enqueue(queue);
      this.run();
    });
  }

  run() {
    if (this.queue.length > 0 && !this.running) {
      this.running = true;
      const job    = this.dequeue();
      if (!job) return;
      job
        .run()
        .then(job.resolve)
        .catch(job.reject)
        .finally(() => {
          this.running = false;
          this.run();
        });
    }
  }
}
