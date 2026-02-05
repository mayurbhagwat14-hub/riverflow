import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

// Ye line Next.js ko bolegi ki isse build ke time render na kare (Solve build error)
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorId } = await request.json();

    if (!questionId || !answer || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        content: answer,
        authorId: authorId,
        questionId: questionId,
      },
    );

    // Increase author reputation
    try {
      const prefs = await users.getPrefs<UserPrefs>(authorId);
      await users.updatePrefs(authorId, {
        reputation: (Number(prefs.reputation) || 0) + 1,
      });
    } catch (prefsError) {
      console.error("Failed to update prefs:", prefsError);
      // Reputation fail hone par pura process mat roko
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error creating answer" },
      { status: error?.status || error?.code || 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    if (!answerId) {
      return NextResponse.json(
        { error: "Answer ID is required" },
        { status: 400 },
      );
    }

    const answer = await databases.getDocument(db, answerCollection, answerId);

    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId,
    );

    // Decrease the reputation
    try {
      const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
      await users.updatePrefs(answer.authorId, {
        reputation: (Number(prefs.reputation) || 0) - 1,
      });
    } catch (prefsError) {
      console.error("Failed to update prefs:", prefsError);
    }

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error deleting the answer" },
      { status: error?.status || error?.code || 500 },
    );
  }
}
