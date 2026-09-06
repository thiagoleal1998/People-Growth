"use client";

// Imperative in-app replacements for window.confirm/prompt/alert — those
// native browser dialogs can't be styled or themed and look out of place
// next to the rest of the admin/author UI. Any client component can call
// confirmDialog()/promptDialog()/alertDialog() from anywhere (event handlers,
// no provider wiring needed) and DialogHost — mounted once in the admin and
// author root layouts — renders the actual modal and resolves the promise.

type ConfirmRequest = {
  kind: "confirm";
  message: string;
  danger?: boolean;
  confirmText?: string;
  resolve: (value: boolean) => void;
};

type PromptRequest = {
  kind: "prompt";
  message: string;
  defaultValue: string;
  resolve: (value: string | null) => void;
};

type AlertRequest = {
  kind: "alert";
  message: string;
  resolve: (value: void) => void;
};

export type DialogRequest = ConfirmRequest | PromptRequest | AlertRequest;

let listener: ((request: DialogRequest) => void) | null = null;

export function registerDialogListener(fn: (request: DialogRequest) => void): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function confirmDialog(message: string, opts?: { danger?: boolean; confirmText?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(message));
      return;
    }
    listener({ kind: "confirm", message, danger: opts?.danger, confirmText: opts?.confirmText, resolve });
  });
}

export function promptDialog(message: string, defaultValue = ""): Promise<string | null> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.prompt(message, defaultValue));
      return;
    }
    listener({ kind: "prompt", message, defaultValue, resolve });
  });
}

export function alertDialog(message: string): Promise<void> {
  return new Promise((resolve) => {
    if (!listener) {
      window.alert(message);
      resolve();
      return;
    }
    listener({ kind: "alert", message, resolve });
  });
}
