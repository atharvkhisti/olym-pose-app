import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  getTokensFromCookies,
  verifyAccessToken,
  clearAuthCookies,
} from "@/lib/auth";
import { HTTP_STATUS } from "@/lib/constants";

export async function POST() {
  try {
    const { accessToken } = await getTokensFromCookies();

    // Clear cookies regardless of token validity
    await clearAuthCookies();

    // If we have a valid token, clear refresh token from database
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, {
          $unset: { refreshToken: 1 },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookies even if there's an error
    await clearAuthCookies();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: HTTP_STATUS.OK }
    );
  }
}
