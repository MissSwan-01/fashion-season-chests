// ================================================================
// 🏠 APARTMENT INCOME + 🎁 GIFTS FLASHBACK EVENT
// ================================================================
//
// This script performs two jobs:
//
// 1. Collect apartment income.
// 2. If the player is NOT already playing a flashback event,
//    find an unlocked Gifts flashback event and activate one.
//
// IMPORTANT:
// - This script uses internal game requests instead of normal clicks
//   wherever possible.
// - Lots of console logs are included so errors are easier to debug.
// - The existing Playwright "page" from mspc.js is reused.
// ================================================================


module.exports = async function runApartmentAndGifts(page) {

  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🏠 STARTING APARTMENT + GIFTS FLASHBACK SCRIPT');
  console.log('════════════════════════════════════════════════════════════════');


  // ==============================================================
  // STEP 1 + STEP 2
  // 🏠 APARTMENT INCOME
  // ==============================================================

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🏠 STEP 1: Opening Apartment page...');
  console.log('────────────────────────────────────────────────────────────────');

  await page.goto(
    'https://v3.g.ladypopular.com/apartment.php',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  console.log('✅ Apartment page loaded.');



  // --------------------------------------------------------------
  // STEP 2
  // Collect apartment income using the game's internal request.
  //
  // The request observed from the game is:
  //
  // GET
  // /ajax/apartment.php?type=collectApartmentRent
  //
  // The response is not used to decide whether the collection
  // succeeded, because your instructions say that sending the
  // request is sufficient.
  // --------------------------------------------------------------

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🏠 STEP 2: Collecting apartment income...');
  console.log('────────────────────────────────────────────────────────────────');

  try {

    const apartmentResponse = await page.evaluate(async () => {

      const response = await fetch(
        'https://v3.g.ladypopular.com/ajax/apartment.php?type=collectApartmentRent',
        {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      return await response.json();

    });

    console.log('📦 Apartment collection response received.');

    if (apartmentResponse && apartmentResponse.status === 1) {

      console.log('✅ Apartment income collection request succeeded.');

      // These values are only logged for debugging/information.
      // The script does NOT depend on them.
      if (apartmentResponse.apartment_income_data) {

        console.log(
          `💰 Apartment income: ${apartmentResponse.apartment_income_data.apartment_income}`
        );

        console.log(
          `⏳ Time until next income: ${apartmentResponse.apartment_income_data.time_until_next_income}s`
        );

      }

    } else {

      console.log(
        '⚠️ Apartment request returned a response, but status was not 1.'
      );

      console.log(
        `📦 Response status: ${apartmentResponse?.status}`
      );

    }

  } catch (error) {

    console.log(
      `❌ Apartment income request failed: ${error.message}`
    );

    // We throw the error here because the apartment request itself
    // failed. This allows mspc.js to handle the failure normally.
    throw error;

  }


  console.log('🏠 Apartment income step finished.');



  // ==============================================================
  // STEP 3 + STEP 4
  // 🎁 OPEN GUILD PAGE
  // CHECK WHETHER A FLASHBACK EVENT IS ALREADY ACTIVE
  // ==============================================================

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🎁 STEP 3: Opening Guild page...');
  console.log('────────────────────────────────────────────────────────────────');

  await page.goto(
    'https://v3.g.ladypopular.com/guild.php',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  console.log('✅ Guild page loaded.');



  // --------------------------------------------------------------
  // STEP 4
  //
  // We need to determine whether an EVENT flashback is already
  // active.
  //
  // IMPORTANT:
  //
  // We specifically look for:
  //
  // .header-event-banner[data-is_flashback="1"]
  //
  // A normal/new event has:
  //
  // data-is_flashback=""
  //
  // An active flashback event has:
  //
  // data-is_flashback="1"
  //
  // We only care about the EVENT flashback slot here.
  // We do NOT treat a flashback collection as an active
  // flashback event.
  // --------------------------------------------------------------

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🔎 STEP 4: Checking for an already-active flashback event...');
  console.log('────────────────────────────────────────────────────────────────');


  const activeFlashbackEvents = await page.locator(
    '#header-events-container .header-event-banner[data-is_flashback="1"]'
  ).count();


  console.log(
    `🔎 Active flashback event elements found: ${activeFlashbackEvents}`
  );


  // --------------------------------------------------------------
  // CASE 1
  // A flashback event is already active.
  //
  // According to your instructions:
  // STOP HERE.
  // Do not request the event list.
  // Do not activate another event.
  // --------------------------------------------------------------

  if (activeFlashbackEvents > 0) {

    console.log('');
    console.log('🟢 CASE 1: A flashback event is already active.');
    console.log('⛔ No further Gifts event processing is required.');
    console.log('🏁 Apartment + Gifts script finished.');

    console.log(
      '════════════════════════════════════════════════════════════════'
    );

    return;

  }


  // --------------------------------------------------------------
  // CASE 2
  // No flashback event is active.
  //
  // Continue to Step 5.
  // --------------------------------------------------------------

  console.log('');
  console.log('🟡 CASE 2: No flashback event is currently active.');
  console.log('➡️ Proceeding to Step 5.');



  // ==============================================================
  // STEP 5
  // 🎁 GET GIFTS FLASHBACK EVENTS
  // ==============================================================

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🎁 STEP 5: Requesting Gifts flashback events...');
  console.log('────────────────────────────────────────────────────────────────');


  let eventsResponse;


  try {

    eventsResponse = await page.evaluate(async () => {

      const response = await fetch(
        'https://v3.g.ladypopular.com/ajax/events.php',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
          },

          body: new URLSearchParams({
            'event_types[]': 'gifts',
            'ignore_won_rewards': 'false',
            'type': 'loadMoreEvents',
            'offset': '0',
            'name': ''
          }),

          credentials: 'same-origin'
        }
      );

      return await response.json();

    });


    console.log('📦 Gifts event response received.');

  } catch (error) {

    console.log(
      `❌ Failed to request Gifts flashback events: ${error.message}`
    );

    throw error;

  }



  // --------------------------------------------------------------
  // Make sure the response has the structure we expect.
  // --------------------------------------------------------------

  if (!eventsResponse) {

    console.log('❌ Events response was empty.');

    throw new Error('Empty response received from events.php.');

  }


  if (eventsResponse.status !== 1) {

    console.log(
      `❌ Events request returned status=${eventsResponse.status}`
    );

    throw new Error(
      `Gifts flashback event request failed with status ${eventsResponse.status}.`
    );

  }


  console.log('✅ Events request returned status=1.');



  // --------------------------------------------------------------
  // The event list is inside:
  //
  // response.search_events.list
  //
  // According to the response you provided.
  // --------------------------------------------------------------

  const events = eventsResponse.search_events?.list;


  if (!Array.isArray(events)) {

    console.log('❌ Could not find search_events.list in response.');

    console.log(
      '🔎 Response keys:',
      Object.keys(eventsResponse)
    );

    throw new Error(
      'Unexpected events response structure: search_events.list is missing.'
    );

  }


  console.log(
    `📋 Total event records received in this response: ${events.length}`
  );


  // --------------------------------------------------------------
  // Separate the returned flashback events into:
  //
  // 🔒 LOCKED
  // 🟢 UNLOCKED
  //
  // Your rule:
  //
  // can_be_activated === true
  //       → unlocked
  //
  // can_be_activated === false
  //       → locked
  // --------------------------------------------------------------

  const unlockedEvents = [];
  const lockedEvents = [];


  for (const event of events) {

    // We are expecting flashback events here, but we still
    // explicitly check is_flashback so the script does not
    // accidentally treat some other record as a flashback event.

    if (event.is_flashback !== true) {

      console.log(
        `⚠️ Ignoring non-flashback record: ${event.title} (ID ${event.id})`
      );

      continue;

    }


    if (event.can_be_activated === true) {

      unlockedEvents.push({
        id: event.id,
        title: event.title
      });

    } else {

      lockedEvents.push({
        id: event.id,
        title: event.title,
        lockReason: event.lock_type_info
      });

    }

  }



  // --------------------------------------------------------------
  // Log locked events.
  // --------------------------------------------------------------

  console.log('');
  console.log('🔒 LOCKED EVENTS:');

  if (lockedEvents.length === 0) {

    console.log('   None.');

  } else {

    for (const event of lockedEvents) {

      console.log(
        `   🔒 ID ${event.id} | ${event.title} | Reason: ${event.lockReason}`
      );

    }

  }



  // --------------------------------------------------------------
  // Log unlocked events.
  // --------------------------------------------------------------

  console.log('');
  console.log('🟢 UNLOCKED EVENTS:');

  if (unlockedEvents.length === 0) {

    console.log('   None.');

  } else {

    for (const event of unlockedEvents) {

      console.log(
        `   🟢 ID ${event.id} | ${event.title}`
      );

    }

  }



  // --------------------------------------------------------------
  // If there are no unlocked events, we cannot activate anything.
  // --------------------------------------------------------------

  if (unlockedEvents.length === 0) {

    console.log('');
    console.log('🚫 No unlocked Gifts flashback events were found.');
    console.log('⛔ Cannot activate an event.');
    console.log('🏁 Gifts processing finished.');

    console.log(
      '════════════════════════════════════════════════════════════════'
    );

    return;

  }



  // ==============================================================
  // STEP 6
  // 🎯 RANDOMLY CHOOSE ONE UNLOCKED EVENT
  // ==============================================================

  console.log('');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('🎯 STEP 6: Choosing one unlocked Gifts event...');
  console.log('────────────────────────────────────────────────────────────────');


  // Your instructions say that only ONE event should be activated,
  // and that the event should be selected randomly.

  const randomIndex = Math.floor(
    Math.random() * unlockedEvents.length
  );


  const selectedEvent = unlockedEvents[randomIndex];


  console.log(
    `🎯 Randomly selected event: ${selectedEvent.title}`
  );

  console.log(
    `🆔 Selected event ID: ${selectedEvent.id}`
  );



  // ==============================================================
  // STEP 6 - ACTIVATE EVENT
  // ==============================================================

  console.log('');
  console.log('🚀 Sending activation request...');
  console.log('🌐 Endpoint: /ajax/events.php');
  console.log('📦 type = activateEvent');
  console.log(`🆔 event_id = ${selectedEvent.id}`);


  let activationResponse;


  try {

    activationResponse = await page.evaluate(async (eventId) => {

      const response = await fetch(
        'https://v3.g.ladypopular.com/ajax/events.php',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
          },

          body: new URLSearchParams({
            type: 'activateEvent',
            event_id: String(eventId)
          }),

          credentials: 'same-origin'
        }
      );

      return await response.json();

    }, selectedEvent.id);


  } catch (error) {

    console.log(
      `❌ Event activation request failed: ${error.message}`
    );

    throw error;

  }



  console.log('📦 Activation response received.');

  console.log(
    `📊 Activation response status: ${activationResponse?.status}`
  );


  // --------------------------------------------------------------
  // According to your instructions:
  //
  // status = 1 → SUCCESS
  // --------------------------------------------------------------

  if (activationResponse?.status === 1) {

    console.log('');
    console.log('🎉🎉🎉 EVENT ACTIVATION SUCCESSFUL! 🎉🎉🎉');

    console.log(
      `🎁 Activated Gifts event: ${selectedEvent.title}`
    );

    console.log(
      `🆔 Event ID: ${selectedEvent.id}`
    );

  } else {

    console.log('');
    console.log('❌ EVENT ACTIVATION FAILED.');

    console.log(
      `📊 Server returned status: ${activationResponse?.status}`
    );

    // Do not silently pretend activation worked.
    // Throwing allows mspc.js to record this script as failed.
    throw new Error(
      `Failed to activate Gifts event "${selectedEvent.title}" (ID ${selectedEvent.id}). Server status: ${activationResponse?.status}`
    );

  }



  // ==============================================================
  // FINISHED
  // ==============================================================

  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🎉 APARTMENT + GIFTS FLASHBACK SCRIPT FINISHED SUCCESSFULLY.');
  console.log('════════════════════════════════════════════════════════════════');
};
