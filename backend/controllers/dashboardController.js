import mongoose from "mongoose";

import TypingSession from "../models/TypingSession.js";
import Room from "../models/Room.js";

/*
 * Return the authenticated user's ID.
 *
 * Your saveSession controller currently uses req.user.id,
 * so the dashboard controllers use the same authentication shape.
 */
const getAuthenticatedUserId = (req) => {
  return req.user?.id || req.user?._id;
};

const toNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getSessionDate = (session) => {
  return session?.date || session?.createdAt || null;
};

const getRoomDate = (room) => {
  return room?.completedAt || room?.startedAt || room?.createdAt || null;
};

const getDateKey = (date) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().slice(0, 10);
};

const getYearRange = (year) => {
  return {
    startDate: new Date(Date.UTC(year, 0, 1)),

    endDate: new Date(Date.UTC(year + 1, 0, 1)),
  };
};

/*
 * graphData can have different structures depending
 * on the frontend implementation.
 *
 * This function tries to calculate the session duration
 * only when graphData contains an explicit time value.
 *
 * It does not guess duration from the number of graph points.
 */
const getPracticeDuration = (graphData) => {
  if (!Array.isArray(graphData) || graphData.length === 0) {
    return 0;
  }

  const lastPoint = graphData[graphData.length - 1];

  if (typeof lastPoint === "number") {
    return 0;
  }

  if (!lastPoint || typeof lastPoint !== "object") {
    return 0;
  }

  const possibleTimeValues = [
    lastPoint.elapsedSeconds,
    lastPoint.timeInSeconds,
    lastPoint.seconds,
    lastPoint.time,
  ];

  for (const value of possibleTimeValues) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    }
  }

  return 0;
};

const getRoomPlayerId = (player) => {
  return player?.userId || player?.user || null;
};

const isSameUser = (firstId, secondId) => {
  if (!firstId || !secondId) {
    return false;
  }

  return String(firstId) === String(secondId);
};

/*
 * Find the authenticated player's frozen result.
 *
 * finalLeaderboard is preferred because it is the
 * permanent completed-race snapshot.
 *
 * players is used only as a fallback for older rooms.
 */
const findUserRoomResult = (room, userId) => {
  const frozenResult = Array.isArray(room?.finalLeaderboard)
    ? room.finalLeaderboard.find((player) =>
        isSameUser(getRoomPlayerId(player), userId),
      )
    : null;

  if (frozenResult) {
    return {
      rank: toNumber(frozenResult.rank) || null,

      userId: getRoomPlayerId(frozenResult),

      username: frozenResult.username || "Unknown player",

      profilePhoto: frozenResult.profilePhoto || "",

      progress: toNumber(frozenResult.progress),

      wpm: toNumber(frozenResult.wpm),

      accuracy: toNumber(frozenResult.accuracy),

      correctChars: toNumber(frozenResult.correctChars),

      wrongChars: toNumber(frozenResult.wrongChars),

      backspaceCount: toNumber(frozenResult.backspaceCount),

      finished: Boolean(frozenResult.finished),

      finishedAt: frozenResult.finishedAt || null,
    };
  }

  const activePlayer = Array.isArray(room?.players)
    ? room.players.find((player) => isSameUser(getRoomPlayerId(player), userId))
    : null;

  if (!activePlayer) {
    return null;
  }

  return {
    rank: null,

    userId: getRoomPlayerId(activePlayer),

    username: activePlayer.username || "Unknown player",

    profilePhoto: activePlayer.profilePhoto || "",

    progress: toNumber(activePlayer.progress),

    wpm: toNumber(activePlayer.wpm),

    accuracy: toNumber(activePlayer.accuracy),

    correctChars: toNumber(activePlayer.correctChars),

    wrongChars: toNumber(activePlayer.wrongChars),

    backspaceCount: toNumber(activePlayer.backspaceCount),

    finished: Boolean(activePlayer.finished),

    finishedAt: activePlayer.finishedAt || null,
  };
};

/*
 * Build a normalized leaderboard.
 *
 * finalLeaderboard is used first.
 * players is used only for older completed rooms.
 */
const buildRoomLeaderboard = (room, currentUserId) => {
  const hasFinalLeaderboard =
    Array.isArray(room?.finalLeaderboard) && room.finalLeaderboard.length > 0;

  const source = hasFinalLeaderboard
    ? room.finalLeaderboard
    : Array.isArray(room?.players)
      ? room.players
      : [];

  const leaderboard = source.map((player, index) => {
    const playerId = getRoomPlayerId(player);

    return {
      rank: toNumber(player.rank) || index + 1,

      userId: playerId,

      username: player.username || "Unknown player",

      profilePhoto: player.profilePhoto || "",

      progress: toNumber(player.progress),

      wpm: toNumber(player.wpm),

      accuracy: toNumber(player.accuracy),

      correctChars: toNumber(player.correctChars),

      wrongChars: toNumber(player.wrongChars),

      backspaceCount: toNumber(player.backspaceCount),

      finished: Boolean(player.finished),

      finishedAt: player.finishedAt || null,

      isCurrentUser: isSameUser(playerId, currentUserId),
    };
  });

  if (hasFinalLeaderboard) {
    return leaderboard.sort((first, second) => first.rank - second.rank);
  }

  /*
   * Fallback ranking for old rooms that do not
   * have finalLeaderboard.
   */
  return leaderboard
    .sort((first, second) => {
      if (first.finished !== second.finished) {
        return Number(second.finished) - Number(first.finished);
      }

      if (
        first.finished &&
        second.finished &&
        first.finishedAt &&
        second.finishedAt
      ) {
        const firstFinishedAt = new Date(first.finishedAt).getTime();

        const secondFinishedAt = new Date(second.finishedAt).getTime();

        if (firstFinishedAt !== secondFinishedAt) {
          return firstFinishedAt - secondFinishedAt;
        }
      }

      if (second.progress !== first.progress) {
        return second.progress - first.progress;
      }

      if (second.wpm !== first.wpm) {
        return second.wpm - first.wpm;
      }

      return second.accuracy - first.accuracy;
    })
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
};

const calculateStreaks = (activityDateKeys) => {
  const validDates = [...new Set(activityDateKeys.filter(Boolean))].sort();

  if (validDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < validDates.length; index += 1) {
    const previousDate = new Date(`${validDates[index - 1]}T00:00:00.000Z`);

    const currentDate = new Date(`${validDates[index]}T00:00:00.000Z`);

    const differenceInDays = Math.round(
      (currentDate - previousDate) / 86400000,
    );

    if (differenceInDays === 1) {
      runningStreak += 1;

      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }

  const activitySet = new Set(validDates);

  const today = new Date();

  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);

  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  let cursor;

  if (activitySet.has(getDateKey(today))) {
    cursor = new Date(today);
  } else if (activitySet.has(getDateKey(yesterday))) {
    cursor = new Date(yesterday);
  } else {
    return {
      currentStreak: 0,
      longestStreak,
    };
  }

  let currentStreak = 0;

  while (activitySet.has(getDateKey(cursor))) {
    currentStreak += 1;

    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    currentStreak,
    longestStreak,
  };
};

/*
 * GET /api/user/dashboard/overview
 *
 * Returns:
 * - dashboard summary
 * - GitHub-style daily activity
 * - latest combined performance points
 */
const getDashboardOverview = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const requestedYear = Number(req.query.year);

    const currentYear = new Date().getUTCFullYear();

    const year =
      Number.isInteger(requestedYear) &&
      requestedYear >= 2000 &&
      requestedYear <= currentYear + 1
        ? requestedYear
        : currentYear;

    const { startDate, endDate } = getYearRange(year);

    const [practiceSessions, completedRooms] = await Promise.all([
      TypingSession.find({
        userId,
      })
        .sort({
          date: -1,
          createdAt: -1,
        })
        .select(
          [
            "wpm",
            "accuracy",
            "correctCharacters",
            "incorrectCharacters",
            "backspaceCount",
            "score",
            "penalty",
            "completionPercentage",
            "graphData",
            "date",
            "createdAt",
          ].join(" "),
        )
        .lean(),

      Room.find({
        status: "completed",

        $or: [
          {
            "finalLeaderboard.userId": userId,
          },
          {
            "players.user": userId,
          },
        ],
      })
        .sort({
          completedAt: -1,
          createdAt: -1,
        })
        .select(
          [
            "roomName",
            "roomCode",
            "duration",
            "startedAt",
            "completedAt",
            "createdAt",
            "winner",
            "finalLeaderboard",
            "players",
          ].join(" "),
        )
        .lean(),
    ]);

    const roomResults = completedRooms
      .map((room) => {
        const result = findUserRoomResult(room, userId);

        if (!result) {
          return null;
        }

        return {
          ...result,

          roomId: room._id,

          date: getRoomDate(room),

          duration: toNumber(room.duration),
        };
      })
      .filter(Boolean);

    const practiceCount = practiceSessions.length;

    const roomCount = roomResults.length;

    const totalSessions = practiceCount + roomCount;

    const practiceWpmTotal = practiceSessions.reduce(
      (total, session) => total + toNumber(session.wpm),
      0,
    );

    const roomWpmTotal = roomResults.reduce(
      (total, result) => total + toNumber(result.wpm),
      0,
    );

    const practiceAccuracyTotal = practiceSessions.reduce(
      (total, session) => total + toNumber(session.accuracy),
      0,
    );

    const roomAccuracyTotal = roomResults.reduce(
      (total, result) => total + toNumber(result.accuracy),
      0,
    );

    const practiceBestWpm = practiceSessions.reduce(
      (highest, session) => Math.max(highest, toNumber(session.wpm)),
      0,
    );

    const roomBestWpm = roomResults.reduce(
      (highest, result) => Math.max(highest, toNumber(result.wpm)),
      0,
    );

    const practiceDuration = practiceSessions.reduce(
      (total, session) => total + getPracticeDuration(session.graphData),
      0,
    );

    const roomDuration = roomResults.reduce(
      (total, result) => total + toNumber(result.duration),
      0,
    );

    const activityCounter = new Map();

    practiceSessions.forEach((session) => {
      const sessionDate = getSessionDate(session);

      if (!sessionDate) {
        return;
      }

      const parsedDate = new Date(sessionDate);

      if (parsedDate < startDate || parsedDate >= endDate) {
        return;
      }

      const dateKey = getDateKey(parsedDate);

      if (!dateKey) {
        return;
      }

      activityCounter.set(dateKey, (activityCounter.get(dateKey) || 0) + 1);
    });

    roomResults.forEach((result) => {
      if (!result.date) {
        return;
      }

      const parsedDate = new Date(result.date);

      if (parsedDate < startDate || parsedDate >= endDate) {
        return;
      }

      const dateKey = getDateKey(parsedDate);

      if (!dateKey) {
        return;
      }

      activityCounter.set(dateKey, (activityCounter.get(dateKey) || 0) + 1);
    });

    const activity = [...activityCounter.entries()]
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((first, second) => first.date.localeCompare(second.date));

    const streaks = calculateStreaks(activity.map((item) => item.date));

    const practicePerformance = practiceSessions.map((session) => ({
      id: session._id,
      type: "practice",

      date: getSessionDate(session),

      wpm: toNumber(session.wpm),

      accuracy: toNumber(session.accuracy),
    }));

    const roomPerformance = roomResults.map((result) => ({
      id: result.roomId,

      type: "room",

      date: result.date,

      wpm: toNumber(result.wpm),

      accuracy: toNumber(result.accuracy),
    }));

    const performance = [...practicePerformance, ...roomPerformance]
      .filter((item) => item.date)
      .sort((first, second) => new Date(first.date) - new Date(second.date))
      .slice(-20)
      .map((item) => ({
        ...item,

        label: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(item.date)),
      }));

    return res.json({
      success: true,

      summary: {
        totalSessions,

        practiceSessions: practiceCount,

        multiplayerRooms: roomCount,

        averageWpm:
          totalSessions > 0
            ? (practiceWpmTotal + roomWpmTotal) / totalSessions
            : 0,

        bestWpm: Math.max(practiceBestWpm, roomBestWpm),

        averageAccuracy:
          totalSessions > 0
            ? (practiceAccuracyTotal + roomAccuracyTotal) / totalSessions
            : 0,

        /*
         * Practice duration is counted only when graphData
         * contains an explicit time value.
         */
        totalTypingMinutes: (practiceDuration + roomDuration) / 60,

        currentStreak: streaks.currentStreak,

        longestStreak: streaks.longestStreak,
      },

      activity,
      performance,
    });
  } catch (error) {
    console.error("Get Dashboard Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load dashboard overview.",
    });
  }
};

/*
 * GET /api/user/dashboard/sessions
 *
 * Query:
 * type=practice or rooms
 * page=1
 * limit=10
 */
const getDashboardSessions = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const type = req.query.type === "rooms" ? "rooms" : "practice";

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      25,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const skip = (page - 1) * limit;

    if (type === "practice") {
      const [practiceSessions, total] = await Promise.all([
        TypingSession.find({
          userId,
        })
          .sort({
            date: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .select(
            [
              "wpm",
              "accuracy",
              "correctCharacters",
              "incorrectCharacters",
              "backspaceCount",
              "score",
              "penalty",
              "duration",
              "completionPercentage",
              "graphData",
              "date",
              "createdAt",
            ].join(" "),
          )
          .lean(),

        TypingSession.countDocuments({
          userId,
        }),
      ]);

      const sessions = practiceSessions.map((session) => ({
        id: session._id,

        type: "practice",

        createdAt: getSessionDate(session),

        // duration: getPracticeDuration(session.graphData),
        duration: toNumber(session.duration),

        wpm: toNumber(session.wpm),

        accuracy: toNumber(session.accuracy),

        correctCharacters: toNumber(session.correctCharacters),

        incorrectCharacters: toNumber(session.incorrectCharacters),

        /*
         * These aliases keep the previously supplied
         * dashboard UI compatible.
         */
        correctChars: toNumber(session.correctCharacters),

        wrongChars: toNumber(session.incorrectCharacters),

        backspaceCount: toNumber(session.backspaceCount),

        score: toNumber(session.score),

        penalty: toNumber(session.penalty),

        completionPercentage: toNumber(session.completionPercentage),
      }));

      return res.json({
        success: true,
        type,
        page,
        limit,
        total,

        hasMore: skip + sessions.length < total,

        sessions,
      });
    }

    const roomQuery = {
      status: "completed",

      $or: [
        {
          "finalLeaderboard.userId": userId,
        },
        {
          "players.user": userId,
        },
      ],
    };

    const [rooms, total] = await Promise.all([
      Room.find(roomQuery)
        .sort({
          completedAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .select(
          [
            "roomName",
            "roomCode",
            "duration",
            "startedAt",
            "completedAt",
            "createdAt",
            "winner",
            "finalLeaderboard",
            "players",
          ].join(" "),
        )
        .lean(),

      Room.countDocuments(roomQuery),
    ]);

    const sessions = rooms
      .map((room) => {
        const playerResult = findUserRoomResult(room, userId);

        if (!playerResult) {
          return null;
        }

        return {
          id: room._id,
          type: "room",

          roomName: room.roomName || "Multiplayer race",

          roomCode: room.roomCode,

          createdAt: getRoomDate(room),

          duration: toNumber(room.duration),

          playerCount:
            room.finalLeaderboard?.length || room.players?.length || 0,

          rank: playerResult.rank,

          wpm: toNumber(playerResult.wpm),

          accuracy: toNumber(playerResult.accuracy),

          progress: toNumber(playerResult.progress),

          correctChars: toNumber(playerResult.correctChars),

          wrongChars: toNumber(playerResult.wrongChars),

          backspaceCount: toNumber(playerResult.backspaceCount),

          winner: room.winner || null,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      type,
      page,
      limit,
      total,

      hasMore: skip + rooms.length < total,

      sessions,
    });
  } catch (error) {
    console.error("Get Dashboard Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load dashboard sessions.",
    });
  }
};

/*
 * GET /api/user/dashboard/practice/:sessionId
 */
const getPracticeSessionDetails = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid practice session ID.",
      });
    }

    const session = await TypingSession.findOne({
      _id: sessionId,
      userId,
    }).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Practice session not found.",
      });
    }

    return res.json({
      success: true,

      id: session._id,
      type: "practice",

      wpm: toNumber(session.wpm),

      accuracy: toNumber(session.accuracy),

      duration: toNumber(session.duration),

      text: session.text || "",

      typedText: session.typedText || "",

      correctCharacters: toNumber(session.correctCharacters),

      incorrectCharacters: toNumber(session.incorrectCharacters),

      /*
       * Aliases used by the dashboard modal.
       */
      correctChars: toNumber(session.correctCharacters),

      wrongChars: toNumber(session.incorrectCharacters),

      backspaceCount: toNumber(session.backspaceCount),

      score: toNumber(session.score),

      penalty: toNumber(session.penalty),

      completionPercentage: toNumber(session.completionPercentage),

      graphData: Array.isArray(session.graphData) ? session.graphData : [],

      createdAt: getSessionDate(session),
    });
  } catch (error) {
    console.error("Get Practice Session Details Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load practice session details.",
    });
  }
};

/*
 * GET /api/user/dashboard/rooms/:roomId
 */
const getRoomSessionDetails = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const { roomId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const room = await Room.findOne({
      _id: roomId,

      status: "completed",

      $or: [
        {
          "finalLeaderboard.userId": userId,
        },
        {
          "players.user": userId,
        },
      ],
    }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Completed room not found.",
      });
    }

    const leaderboard = buildRoomLeaderboard(room, userId);

    const playerResult =
      leaderboard.find((player) => player.isCurrentUser) || null;

    const winner = room.winner || leaderboard[0] || null;

    return res.json({
      success: true,

      id: room._id,
      type: "room",

      roomName: room.roomName || "Multiplayer race",

      roomCode: room.roomCode,

      duration: toNumber(room.duration),

      startedAt: room.startedAt || null,

      completedAt: room.completedAt || null,

      createdAt: room.createdAt || null,

      text: room.currentText || "",

      winner,
      playerResult,
      leaderboard,
    });
  } catch (error) {
    console.error("Get Room Session Details Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load room session details.",
    });
  }
};

export {
  getDashboardOverview,
  getDashboardSessions,
  getPracticeSessionDetails,
  getRoomSessionDetails,
};
