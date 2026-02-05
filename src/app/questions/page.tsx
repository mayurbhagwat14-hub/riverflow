import { databases, users } from "@/models/server/config";
import {
  answerCollection,
  db,
  voteCollection,
  questionCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import React, { Suspense } from "react";
import Link from "next/link";
import ShimmerButton from "@/components/magicui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/store/Auth";
import Pagination from "@/components/Pagination";
import Search from "./Search";

const Page = async ({
  searchParams,
}: {
  searchParams: { page?: string; tag?: string; search?: string };
}) => {
  // Fix: Ensure page is treated as a number safely
  const page = parseInt(searchParams.page || "1", 10);

  const queries = [
    Query.orderDesc("$createdAt"),
    Query.offset((page - 1) * 25), // Now 'page' is a guaranteed number
    Query.limit(25),
  ];

  if (searchParams.tag) queries.push(Query.equal("tags", searchParams.tag));

  if (searchParams.search) {
    queries.push(
      Query.or([
        Query.search("title", searchParams.search),
        Query.search("content", searchParams.search),
      ]),
    );
  }

  let questions;
  try {
    questions = await databases.listDocuments(db, questionCollection, queries);
  } catch (error) {
    const basicQueries = [
      Query.orderDesc("$createdAt"),
      Query.offset((page - 1) * 25),
      Query.limit(25),
    ];
    if (searchParams.tag)
      basicQueries.push(Query.equal("tags", searchParams.tag));

    if (searchParams.search) {
      try {
        basicQueries.push(
          Query.or([
            Query.contains("title", searchParams.search),
            Query.contains("content", searchParams.search),
          ]),
        );
        questions = await databases.listDocuments(
          db,
          questionCollection,
          basicQueries,
        );
      } catch (containsError) {
        const fallbackQueries = [
          Query.orderDesc("$createdAt"),
          Query.offset((page - 1) * 25),
          Query.limit(25),
        ];
        if (searchParams.tag)
          fallbackQueries.push(Query.equal("tags", searchParams.tag));
        questions = await databases.listDocuments(
          db,
          questionCollection,
          fallbackQueries,
        );
      }
    } else {
      questions = await databases.listDocuments(
        db,
        questionCollection,
        basicQueries,
      );
    }
  }

  questions.documents = await Promise.all(
    questions.documents.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1),
        ]),
      ]);

      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          reputation: author.prefs.reputation,
          name: author.name,
        },
      };
    }),
  );

  return (
    <div className="container mx-auto px-4 pb-20 pt-36">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <Link href="/questions/ask">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Ask a question
            </span>
          </ShimmerButton>
        </Link>
      </div>

      <div className="mb-4">
        <Suspense
          fallback={
            <div className="h-10 w-full animate-pulse bg-gray-200 dark:bg-gray-700" />
          }
        >
          <Search />
        </Suspense>
      </div>

      <div className="mb-4">
        <p>{questions.total} questions</p>
      </div>

      <div className="mb-4 max-w-3xl space-y-6">
        {questions.documents.length > 0 ? (
          questions.documents.map((ques: any) => (
            <QuestionCard key={ques.$id} ques={ques} />
          ))
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No questions found
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              {searchParams.search
                ? `No questions match your search for "${searchParams.search}"`
                : "Be the first to ask a question!"}
            </p>
            <Link href="/questions/ask">
              <ShimmerButton className="shadow-2xl">
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                  Ask the first question
                </span>
              </ShimmerButton>
            </Link>
          </div>
        )}
      </div>

      <Suspense>
        <Pagination total={questions.total} limit={25} />
      </Suspense>
    </div>
  );
};

export default Page;
