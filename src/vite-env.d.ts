/// <reference types="vite/client" />

declare global {
	interface Window {
		google?: {
			accounts?: {
				id?: {
					initialize: (opts: {
						client_id: string;
						callback: (response: { credential?: string }) => void;
						ux_mode?: "popup" | "redirect";
					}) => void;
					renderButton: (container: HTMLElement, opts?: Record<string, unknown>) => void;
					prompt: () => void;
				};
			};
		};
	}
}

export {};
