
export const LICENSE_CONFIG = {
    audio: [
        {
            id: "license1",
            name: "One-Time Playback License",
            description: "Permits exactly one playback. No downloads/remixing.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Limited Playback License",
            description: "Play up to N times or fixed duration (e.g. 30 days).",
            color: "green"
        },
        {
            id: "license3",
            name: "Commercial Streaming License",
            description: "Unlimited playback on approved platforms. Commercial use allowed.",
            color: "purple"
        },
        {
            id: "license4",
            name: "Derivative / Remix License",
            description: "Create derivative works with attribution. Verification required.",
            color: "orange"
        }
    ],
    image: [
        {
            id: "license1",
            name: "View-Only License",
            description: "View only. No download, storage or screenshots allowed.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Single-Use License",
            description: "One-time use for a single project/publication.",
            color: "green"
        },
        {
            id: "license3",
            name: "Commercial Reuse License",
            description: "Unlimited usage, modification, and resizing allowed.",
            color: "purple"
        },
        {
            id: "license4",
            name: "Exclusive Image License",
            description: "Sole rights to the asset. Non-transferable.",
            color: "orange"
        }
    ],
    text: [
        {
            id: "license1",
            name: "Read-Only License",
            description: "Read only. No copying or AI training allowed.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Quotation License",
            description: "Limited excerpts with attribution.",
            color: "green"
        },
        {
            id: "license3",
            name: "Reproduction License",
            description: "Full reproduction permitted with attribution.",
            color: "purple"
        },
        {
            id: "license4",
            name: "AI Training License",
            description: "Authorized for machine learning/AI training.",
            color: "orange"
        }
    ],
    video: [
        {
            id: "license1",
            name: "One-Time Viewing License",
            description: "View exactly once. No replays or downloads.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Timed Access License",
            description: "Unlimited viewing within a time window (e.g. 24h).",
            color: "green"
        },
        {
            id: "license3",
            name: "Clip Usage License",
            description: "Extract clips for use in other works.",
            color: "purple"
        },
        {
            id: "license4",
            name: "Public Screening License",
            description: "Show to an audience in approved locations.",
            color: "orange"
        }
    ]
};

// Helper to get config for type
export const getLicensesForType = (type) => {
    return LICENSE_CONFIG[type] || LICENSE_CONFIG.image; // default to image if undefined
};
