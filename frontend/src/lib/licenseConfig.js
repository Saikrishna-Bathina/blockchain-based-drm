
export const LICENSE_CONFIG = {
    audio: [
        {
            id: "license1",
            name: "One-Time Playback License",
            description: "Permits exactly one playback. No downloads.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Limited Time Playback",
            description: "Unlimited playback for 24 hours.",
            color: "green"
        }
    ],
    image: [
        {
            id: "license1",
            name: "View-Only License",
            description: "View only. No download allowed.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Time Limited View",
            description: "View for 24 hours.",
            color: "green"
        },
        {
            id: "license3",
            name: "Downloadable License",
            description: "Permits downloading the original file.",
            color: "purple"
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
            description: "View exactly once. No replays.",
            color: "blue"
        },
        {
            id: "license2",
            name: "Time Limited Access",
            description: "Unlimited viewing for 24 hours.",
            color: "green"
        },
        {
            id: "license3",
            name: "Downloadable License",
            description: "Permits downloading the secure video file.",
            color: "purple"
        }
    ]
};

// Helper to get config for type
export const getLicensesForType = (type) => {
    return LICENSE_CONFIG[type] || LICENSE_CONFIG.image; // default to image if undefined
};
