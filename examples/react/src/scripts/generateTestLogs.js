// Example usage:
// node generateTestLogs.js "2025-06-12T14:03:20" "2025-06-12T14:48:00" 10000 test_logs.jsonl

import { writeFileSync } from 'fs';

// Sample log types and their possible messages
const LOG_TYPES = {
    INFO: [
        "Server started",
        "Map loaded",
        "Player joined team",
        "Score updated",
        "Double XP event started",
        "Sudden death mode activated",
        "Match ended in draw",
        "Server entered idle mode"
    ],
    ERROR: [
        "Leaderboard service failed to load",
        "Voice chat server unresponsive",
        "Connection lost to matchmaking service"
    ],
    CONNECT: ["Player connected"],
    DISCONNECT: ["Player disconnected"],
    KILL: ["Player killed another player"],
    OBJECTIVE: [
        "Control point capture started",
        "Control point captured"
    ]
};

// Sample player names
const PLAYERS = [
    "RoguePhoenix", "Sn1perWolf", "SkyHunter", "NinjaWarrior",
    "ShadowBlade", "FrostGiant", "ThunderBolt", "DragonSlayer"
];

// Sample maps
const MAPS = [
    "SkyFortress_Arena_v2", "Desert_Outpost", "Urban_Combat_Zone",
    "Arctic_Base", "Jungle_Temple", "Space_Station"
];

// Sample weapons/methods
const WEAPONS = [
    "Sniper Rifle", "Rocket Launcher", "Assault Rifle",
    "Shotgun", "SMG", "Grenade Launcher"
];

function generateDetails(logType, message) {
    let details = {};
    
    if (logType === "INFO") {
        if (message.includes("Server started")) {
            details = {
                port: Math.floor(Math.random() * 1000) + 27000,
                region: ["NA-East", "NA-West", "EU", "Asia"][Math.floor(Math.random() * 4)]
            };
        } else if (message.includes("Map loaded")) {
            details = { map: MAPS[Math.floor(Math.random() * MAPS.length)] };
        } else if (message.includes("Player joined team")) {
            details = {
                player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
                team: ["RED", "BLUE"][Math.floor(Math.random() * 2)]
            };
        } else if (message.includes("Score updated")) {
            details = {
                RED: Math.floor(Math.random() * 6),
                BLUE: Math.floor(Math.random() * 6)
            };
        } else if (message.includes("Double XP event started")) {
            details = { event: "Double XP" };
        } else if (message.includes("Sudden death mode activated")) {
            details = { match_time_elapsed_minutes: Math.floor(Math.random() * 11) + 5 };
        }
    } else if (logType === "ERROR") {
        if (message.includes("Leaderboard service failed to load")) {
            details = {
                error_code: [503, 500, 404][Math.floor(Math.random() * 3)],
                retrying: Math.random() > 0.5
            };
        } else if (message.includes("Voice chat server unresponsive")) {
            details = {
                timeout_ms: Math.floor(Math.random() * 1000) + 1000,
                affected_players: [...PLAYERS].sort(() => 0.5 - Math.random()).slice(0, 2)
            };
        } else if (message.includes("Connection lost to matchmaking service")) {
            details = {
                service: "Matchmaker",
                status: "offline"
            };
        }
    } else if (logType === "CONNECT") {
        details = {
            player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
            ip: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
        };
    } else if (logType === "DISCONNECT") {
        details = {
            player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
            reason: ["Ping Timeout", "User Disconnected", "Connection Lost"][Math.floor(Math.random() * 3)]
        };
    } else if (logType === "KILL") {
        const killer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
        const victim = PLAYERS.filter(p => p !== killer)[Math.floor(Math.random() * (PLAYERS.length - 1))];
        details = {
            killer,
            victim,
            method: WEAPONS[Math.floor(Math.random() * WEAPONS.length)],
            xp: [50, 100, 150][Math.floor(Math.random() * 3)]
        };
        if (Math.random() > 0.5) {
            details.bonus = ["Headshot", "Double XP"][Math.floor(Math.random() * 2)];
        }
    } else if (logType === "OBJECTIVE") {
        if (message.includes("capture started")) {
            details = {
                player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
                point: ["A", "B", "C"][Math.floor(Math.random() * 3)]
            };
        } else {
            details = {
                team: ["RED", "BLUE"][Math.floor(Math.random() * 2)],
                point: ["A", "B", "C"][Math.floor(Math.random() * 3)]
            };
        }
    }
    
    return details;
}

function generateLogs(startTime, endTime, numLogs) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalSeconds = (end - start) / 1000;
    
    const logs = [];
    for (let i = 0; i < numLogs; i++) {
        // Calculate timestamp for this log
        const timestamp = new Date(start.getTime() + (totalSeconds * i / numLogs) * 1000);
        
        // Randomly select log type and message
        const logTypes = Object.keys(LOG_TYPES);
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
        const messages = LOG_TYPES[logType];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Generate log entry
        const logEntry = {
            start_time: timestamp.toISOString(),
            type: logType,
            message: message,
            details: generateDetails(logType, message)
        };
        
        logs.push(logEntry);
    }
    
    return logs;
}

// Get command line arguments
const args = process.argv.slice(2);
const startTime = args[0];
const endTime = args[1];
const numLogs = parseInt(args[2]);
const outputFile = args[3] || 'test_logs.jsonl';

if (!startTime || !endTime || isNaN(numLogs)) {
    console.log('Usage: node generateTestLogs.js <start-time> <end-time> <num-logs> [output-file]');
    console.log('Example: node generateTestLogs.js "2025-06-12T14:00:00" "2025-06-12T15:00:00" 50 test_logs.jsonl');
    process.exit(1);
}

const logs = generateLogs(startTime, endTime, numLogs);
// Write each log entry on a separate line
writeFileSync(outputFile, logs.map(log => JSON.stringify(log)).join('\n'));
console.log(`Generated ${logs.length} logs and saved to ${outputFile}`); 