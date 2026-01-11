import React, { type ComponentType } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { Queue } from "./queue";

interface Instance {
  component: ComponentType<any>;
  ref: React.RefObject<any>;
}

let instances: Map<string, Instance> | null = null;
let container: HTMLElement | null           = null;
let root: Root | null                       = null;

const queue = new Queue();

function createGlobalContainer() {
  const target = document.createElement("div");
  target.id    = "global-singleton-container";
  document.body.appendChild(target);

  root      = createRoot(target);
  instances = new Map();
  container = target;
  renderInstances();
}

function renderInstances() {
  if (root && instances) {
    root.render(<GlobalContainer instances={Array.from(instances.values())} />);
  }
}

interface GlobalContainerProps {
  instances: Instance[];
}

function GlobalContainer({ instances }: GlobalContainerProps) {
  return (
    <>
      {instances.map((item, idx) => {
        const Component = item.component;
        return <Component key={idx} ref={item.ref} />;
      })}
    </>
  );
}

async function createInstance(component: ComponentType<any>) {
  if (!instances) createGlobalContainer();

  let instance = instances!.get(component.name);

  if (!instance) {
    const ref = React.createRef<any>();
    instance  = { component, ref };
    instances!.set(component.name, instance);
    renderInstances();

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return instance.ref.current;
}

async function removeInstance(component: ComponentType<any>) {
  if (instances && container) {
    instances.delete(component.name);
    renderInstances();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

export async function useSingleton<T = any>(component: ComponentType<any>): Promise<T> {
  const result = await queue.add(() => createInstance(component));
  return result as T;
}

export async function removeSingleton(component: ComponentType<any>): Promise<void> {
  await queue.add(() => removeInstance(component));
}
