-- CreateTable
CREATE TABLE "QuoteComments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,

    CONSTRAINT "QuoteComments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuoteComments" ADD CONSTRAINT "QuoteComments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteComments" ADD CONSTRAINT "QuoteComments_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
