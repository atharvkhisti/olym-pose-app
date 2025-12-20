import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  getTokensFromCookies,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from "@/lib/auth";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

export async function POST() {
  try {
    const { refreshToken } = await getTokensFromCookies();

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    await connectDB();

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Generate new tokens
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
