/// <reference types="@tixyel/streamelements" />
/// <reference types="motion" />

declare global {
  interface Window {
    Motion: typeof import('motion');
  }
}

export {};
