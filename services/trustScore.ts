import prisma from "@/lib/prisma";

/**
 * Updates the trust score of a User or Driver.
 * Scores start at 100. This function applies a penalty to their score.
 */
export async function applyIncidentPenalty(
  targetType: "USER" | "DRIVER",
  targetId: string,
  penalty: number = 10,
  reason: string = "Abuse or incident reported"
) {
  try {
    if (targetType === "USER") {
      const user = await prisma.user.update({
        where: { id: targetId },
        data: {
          trustScore: {
            decrement: penalty
          }
        }
      });
      console.log(`[TRUST SCORE] User ${targetId} penalized by ${penalty}. New Score: ${user.trustScore}. Reason: ${reason}`);
      return user.trustScore;
    } else if (targetType === "DRIVER") {
      const driver = await prisma.driver.update({
        where: { id: targetId },
        data: {
          trustScore: {
            decrement: penalty
          }
        }
      });
      console.log(`[TRUST SCORE] Driver ${targetId} penalized by ${penalty}. New Score: ${driver.trustScore}. Reason: ${reason}`);
      return driver.trustScore;
    }
  } catch (error) {
    console.error("[TRUST SCORE ERROR]", error);
    throw error;
  }
}
