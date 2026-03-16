"use client";

import { Toaster, toast } from "sonner";

export { toast };

function GoeyToaster(props) {
  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "goey-toast group flex items-center gap-3 w-[380px] px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl pointer-events-auto",
            title: "goey-toast-title text-sm font-semibold leading-tight",
            description:
              "goey-toast-desc text-xs leading-snug opacity-80 mt-0.5",
            actionButton:
              "goey-toast-action px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
            cancelButton:
              "goey-toast-cancel px-3 py-1.5 rounded-lg text-xs font-medium opacity-70 hover:opacity-100 transition-all duration-200",
            closeButton:
              "goey-toast-close !bg-white/10 !border-white/20 !text-current hover:!bg-white/20 !transition-all !duration-200 hover:!scale-110 hover:!rotate-90",
            success:
              "goey-toast--success !bg-emerald-500/15 !border-emerald-400/30 !text-emerald-100 !shadow-[0_8px_32px_rgba(16,185,129,0.25)]",
            error:
              "goey-toast--error !bg-rose-500/15 !border-rose-400/30 !text-rose-100 !shadow-[0_8px_32px_rgba(244,63,94,0.25)]",
            warning:
              "goey-toast--warning !bg-amber-500/15 !border-amber-400/30 !text-amber-100 !shadow-[0_8px_32px_rgba(245,158,11,0.25)]",
            info: "goey-toast--info !bg-sky-500/15 !border-sky-400/30 !text-sky-100 !shadow-[0_8px_32px_rgba(14,165,233,0.25)]",
            loading:
              "goey-toast--loading !bg-violet-500/15 !border-violet-400/30 !text-violet-100 !shadow-[0_8px_32px_rgba(139,92,246,0.25)]",
            default:
              "goey-toast--default !bg-slate-800/80 !border-white/10 !text-slate-100 !shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
          },
        }}
        {...props}
      />
      <style jsx global>{`
       

        /* Entrance animation */
        [data-sonner-toaster] [data-sonner-toast] {
          animation: goey-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top center;
          will-change: transform, opacity, filter;
        }

        @keyframes goey-slide-in {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.92);
            filter: blur(8px);
          }
          50% {
            opacity: 0.8;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }

        /* Exit animation */
        [data-sonner-toaster] [data-sonner-toast][data-removed="true"] {
          animation: goey-slide-out 0.35s cubic-bezier(0.55, 0, 1, 0.45) forwards !important;
        }

        @keyframes goey-slide-out {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-16px) scale(0.94);
            filter: blur(6px);
          }
        }

        /* Glassmorphism base layer */
        .goey-toast {
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          position: relative;
          overflow: hidden;
        }

        /* Animated shimmer border */
        .goey-toast::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            #ffcb6b,
            #3d8bff,
            #5b6cf9
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          animation: goey-shimmer 3s ease-in-out infinite;
        }

        @keyframes goey-shimmer {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* Glow pulse effect behind toast */
        .goey-toast::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
          filter: blur(12px);
        }

        .goey-toast:hover::after {
          opacity: 0.6;
        }

        /* Type-specific glow colors */
        .goey-toast--success::after {
          background: radial-gradient(
            ellipse at center,
            rgba(16, 185, 129, 0.3),
            transparent 70%
          );
        }
        .goey-toast--error::after {
          background: radial-gradient(
            ellipse at center,
            rgba(244, 63, 94, 0.3),
            transparent 70%
          );
        }
        .goey-toast--warning::after {
          background: radial-gradient(
            ellipse at center,
            rgba(245, 158, 11, 0.3),
            transparent 70%
          );
        }
        .goey-toast--info::after {
          background: radial-gradient(
            ellipse at center,
            rgba(14, 165, 233, 0.3),
            transparent 70%
          );
        }
        .goey-toast--loading::after {
          background: radial-gradient(
            ellipse at center,
            rgba(139, 92, 246, 0.3),
            transparent 70%
          );
        }
        .goey-toast--default::after {
          background: radial-gradient(
            ellipse at center,
            rgba(148, 163, 184, 0.2),
            transparent 70%
          );
        }

        /* Hover micro-interaction */
        .goey-toast {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.25s ease;
        }

        .goey-toast:hover {
          transform: translateY(-2px) scale(1.01);
        }

        /* Icon pulse for success/error */
        .goey-toast--success [data-icon],
        .goey-toast--error [data-icon] {
          animation: goey-icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
            0.15s both;
        }

        @keyframes goey-icon-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Loading spinner glow */
        .goey-toast--loading [data-icon] svg {
          filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));
        }

        /* Progress bar (for auto-dismiss) */
        [data-sonner-toaster]
          [data-sonner-toast]
          [data-content]
          ~ [style*="--offset"] {
          background: linear-gradient(
            90deg,
            #ffcb6b,
            #3d8bff,
            #5b6cf9
          ) !important;
          border-radius: 999px;
        }

        /* Stack animation offset */
        [data-sonner-toaster][data-y-position="top"]
          [data-sonner-toast]:nth-child(n + 2) {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Responsive toast width */
        @media (max-width: 480px) {
          .goey-toast {
            width: calc(100vw - 32px) !important;
            max-width: 380px;
          }
        }
      `}</style>
    </>
  );
}

export { GoeyToaster };