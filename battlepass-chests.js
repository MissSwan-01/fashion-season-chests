// ================================================================
// 🎁 BATTLE PASS CHEST COLLECTION
// ================================================================
//
// This script attempts to collect all listed Battle Pass chests
// for both the current season and the previous season.
//
// The chest-claim request is sent directly to the game's internal
// endpoint, using the existing authenticated Playwright page.
// ================================================================


module.exports = async function runBattlePassChests(page) {

  console.log('🎁 Battle Pass chest collection starting...');


  // ==============================================================
  // STEP 1
  // 🌐 OPEN GAME PAGE
  // ==============================================================

  await page.goto(
    'https://v3.g.ladypopular.com/guild.php',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );


  // ==============================================================
  // STEP 2
  // 🎁 CHEST LIST
  // ==============================================================

  const CHESTS = [
    { css: 'c1-2', id: 33 },
    { css: 'c2-2', id: 34 },
    { css: 'c3-2', id: 95 },
    { css: 'c4-2', id: 96 },
    { css: 'c5-2', id: 37 },
    { css: 'c6-2', id: 97 },
    { css: 'c7-2', id: 39 },
    { css: 'c8-2', id: 98 },
    { css: 'c9-2', id: 99 },
    { css: 'c10-2', id: 100 },
    { css: 'c11-2', id: 43 },
    { css: 'c12-2', id: 44 },
    { css: 'c13-2', id: 45 },
    { css: 'c14-2', id: 46 },
    { css: 'c15-2', id: 101 },
    { css: 'c16-2', id: 48 },
    { css: 'c17-2', id: 49 },
    { css: 'c18-2', id: 102 },
    { css: 'c19-2', id: 103 },
    { css: 'c20-2', id: 52 },
    { css: 'c21-2', id: 53 },
    { css: 'c22-2', id: 104 },
    { css: 'c23-2', id: 105 },
    { css: 'c24-2', id: 106 },
    { css: "c25-2", id: 57 },
    { css: 'c26-2', id: 58 },
    { css: 'c27-2', id: 59 },
    { css: 'c28-2', id: 60 },
    { css: "c29-2", id: 61 },
    { css: 'c30-2', id: 62 },

    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 },
    { css: 'r-2', id: 107 }
  ];


  // ==============================================================
  // STEP 3
  // 🎁 COLLECT CHESTS
  // ==============================================================

  for (const previousSeason of [0, 1]) {

    for (const chest of CHESTS) {

      try {

        const result = await page.evaluate(
          async ({ chestId, previousSeason, chestCss }) => {

            const body = new URLSearchParams({
              action: 'chestClaim',
              chest_id: String(chestId),
              previousSeason: String(previousSeason),
              chest_css_class: chestCss
            });


            const response = await fetch(
              'https://v3.g.ladypopular.com/ajax/battlepass/chest.php',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                  'X-Requested-With': 'XMLHttpRequest'
                },

                credentials: 'include',

                body: body.toString()
              }
            );


            return await response.json();

          },
          {
            chestId: chest.id,
            previousSeason,
            chestCss: chest.css
          }
        );


        if (result?.status === 1) {

          console.log(
            `✅ Collected ${chest.css} (ID ${chest.id}) - Season ${previousSeason}`
          );

        }


        // Keep the same small delay as the working browser-console code.
        await new Promise(resolve => setTimeout(resolve, 10));


      } catch (error) {

        // One failed chest should not stop the remaining chests.
        console.log(
          `❌ Chest ${chest.css} (ID ${chest.id}) failed.`
        );

      }

    }

  }


  // ==============================================================
  // FINISHED
  // ==============================================================

  console.log('🎁 Battle Pass chest collection finished.');

};
