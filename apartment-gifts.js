// ================================================================
// 🏠 APARTMENT INCOME + 🎁 GIFTS FLASHBACK EVENT
// ================================================================
//
// DEBUG VERSION
//
// Logic is unchanged.
// Extra console logs have been added to identify exactly where
// the Gifts flashback process is failing.
// ================================================================


module.exports = async function runApartmentAndGifts(page) {

  console.log('');
  console.log('============================================================');
  console.log('🏠 APARTMENT + 🎁 GIFTS FLASHBACK STARTING');
  console.log('============================================================');
  console.log('🕐 Script started at:', new Date().toISOString());
  console.log('🌐 Current URL:', page.url());


  // ============================================================== 
  // STEP 1 + STEP 2
  // 🏠 APARTMENT INCOME
  // ==============================================================

  console.log('');
  console.log('------------------------------------------------------------');
  console.log('🏠 STEP 1: Opening apartment page...');
  console.log('------------------------------------------------------------');

  await page.goto(
    'https://v3.g.ladypopular.com/apartment.php',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  console.log('✅ Apartment page loaded.');
  console.log('🌐 URL:', page.url());


  // --------------------------------------------------------------
  // STEP 2
  // Collect apartment income
  // --------------------------------------------------------------

  console.log('');
  console.log('💰 STEP 2: Attempting to collect apartment income...');
  console.log('📡 Request: GET /ajax/apartment.php?type=collectApartmentRent');


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


    console.log('📥 Apartment server response:');
    console.log(apartmentResponse);


    if (apartmentResponse && apartmentResponse.status === 1) {

      console.log('💰 Apartment income collected successfully.');

    } else {

      console.log(
        `⚠️ Apartment collection returned status=${apartmentResponse?.status}`
      );

    }

  } catch (error) {

    console.log('');
    console.log('❌❌❌ APARTMENT REQUEST FAILED ❌❌❌');
    console.log('Error:', error);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);

    throw error;

  }


  // ============================================================== 
  // STEP 3
  // 🎁 OPEN GUILD PAGE
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🎁 STEP 3: Opening guild page...');
  console.log('============================================================');

  try {

    await page.goto(
      'https://v3.g.ladypopular.com/guild.php',
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      }
    );

    console.log('✅ Guild page loaded.');
    console.log('🌐 Current URL:', page.url());

  } catch (error) {

    console.log('');
    console.log('❌❌❌ GUILD PAGE FAILED TO LOAD ❌❌❌');
    console.log('Error:', error);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);

    throw error;

  }


  // ============================================================== 
  // STEP 4
  // 🔎 CHECK ACTIVE FLASHBACK
  // ==============================================================

  console.log('');
  console.log('------------------------------------------------------------');
  console.log('🔎 STEP 4: Checking for active flashback event...');
  console.log('------------------------------------------------------------');

  console.log(
    '🔍 Selector:',
    '#header-events-container .header-event-banner[data-is_flashback="1"]'
  );


  let activeFlashbackEvents;

  try {

    activeFlashbackEvents = await page.locator(
      '#header-events-container .header-event-banner[data-is_flashback="1"]'
    ).count();

  } catch (error) {

    console.log('');
    console.log('❌ ERROR WHILE CHECKING FLASHBACK SELECTOR');
    console.log('Error:', error);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);

    throw error;

  }


  console.log(
    '🔢 Number of active flashback event banners found:',
    activeFlashbackEvents
  );


  // Extra diagnostic information only.
  // This does NOT affect the logic.

  try {

    const bannerInfo = await page.locator(
      '#header-events-container .header-event-banner'
    ).evaluateAll(elements =>
      elements.map(element => ({
        text: element.innerText,
        isFlashback: element.getAttribute('data-is_flashback'),
        className: element.className
      }))
    );

    console.log('📋 All event banners currently on guild page:');
    console.log(bannerInfo);

  } catch (error) {

    console.log(
      '⚠️ Could not read additional event banner information:',
      error.message
    );

  }


  // --------------------------------------------------------------
  // CASE 1
  // Flashback already active
  // --------------------------------------------------------------

  if (activeFlashbackEvents > 0) {

    console.log('');
    console.log('🎁 FLASHBACK ALREADY ACTIVE');
    console.log('🛑 Stopping Gifts process.');
    console.log('============================================================');

    return;

  }


  // --------------------------------------------------------------
  // CASE 2
  // No flashback active
  // --------------------------------------------------------------

  console.log('');
  console.log('✅ No active flashback event detected.');
  console.log('➡️ Continuing to Gifts event request...');


  // ============================================================== 
  // STEP 5
  // 🎁 GET GIFTS FLASHBACK EVENTS
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🎁 STEP 5: Requesting Gifts flashback events...');
  console.log('============================================================');

  console.log('📡 Endpoint:');
  console.log('https://v3.g.ladypopular.com/ajax/events.php');

  console.log('');
  console.log('📦 POST parameters:');
  console.log({
    'event_types[]': 'gifts',
    'ignore_won_rewards': 'false',
    type: 'loadMoreEvents',
    offset: '0',
    name: ''
  });


  let eventsResponse;


  try {

    eventsResponse = await page.evaluate(async () => {

      console.log(
        '[Browser] Starting fetch to events.php...'
      );

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
            type: 'loadMoreEvents',
            offset: '0',
            name: ''
          }),

          credentials: 'same-origin'
        }
      );


      console.log(
        '[Browser] events.php HTTP status:',
        response.status
      );

      console.log(
        '[Browser] events.php response OK:',
        response.ok
      );

      console.log(
        '[Browser] events.php response URL:',
        response.url
      );


      const text = await response.text();

      console.log(
        '[Browser] Raw events.php response length:',
        text.length
      );

      console.log(
        '[Browser] Raw events.php response:',
        text
      );


      let json;

      try {

        json = JSON.parse(text);

        console.log(
          '[Browser] Successfully parsed JSON response.'
        );

      } catch (parseError) {

        console.log(
          '[Browser] ❌ JSON PARSING FAILED'
        );

        console.log(
          '[Browser] Parse error:',
          parseError.message
        );

        throw parseError;

      }


      return json;

    });


    console.log('');
    console.log('📥 Gifts events server response received.');
    console.log('Full parsed response:');
    console.dir(eventsResponse, { depth: null });


  } catch (error) {

    console.log('');
    console.log('❌❌❌ GIFTS EVENTS REQUEST FAILED ❌❌❌');
    console.log('Error:', error);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);

    throw error;

  }


  // ============================================================== 
  // RESPONSE VALIDATION
  // ==============================================================

  console.log('');
  console.log('------------------------------------------------------------');
  console.log('🔎 Checking Gifts events response...');
  console.log('------------------------------------------------------------');


  if (!eventsResponse) {

    console.log('❌ eventsResponse is EMPTY / undefined / null.');

    throw new Error(
      'Empty response received from events.php.'
    );

  }


  console.log(
    '✅ eventsResponse exists.'
  );

  console.log(
    '📌 eventsResponse.status =',
    eventsResponse.status
  );


  if (eventsResponse.status !== 1) {

    console.log('');
    console.log('❌ EVENTS REQUEST RETURNED NON-SUCCESS STATUS');
    console.log('Expected status: 1');
    console.log('Actual status:', eventsResponse.status);

    console.log('');
    console.log('Full response:');
    console.dir(eventsResponse, { depth: null });


    throw new Error(
      `Gifts flashback event request failed with status ${eventsResponse.status}.`
    );

  }


  console.log('✅ eventsResponse.status === 1');


  // ============================================================== 
  // GET EVENT LIST
  // ==============================================================

  console.log('');
  console.log('------------------------------------------------------------');
  console.log('📋 Reading response.search_events.list...');
  console.log('------------------------------------------------------------');


  console.log(
    'search_events:',
    eventsResponse.search_events
  );


  const events = eventsResponse.search_events?.list;


  console.log(
    'events list:',
    events
  );


  if (!Array.isArray(events)) {

    console.log('');
    console.log('❌❌❌ EVENT LIST IS NOT AN ARRAY ❌❌❌');

    console.log(
      'typeof events =',
      typeof events
    );

    console.log(
      'Array.isArray(events) =',
      Array.isArray(events)
    );

    console.log('');
    console.log('search_events object:');
    console.dir(eventsResponse.search_events, { depth: null });

    console.log('');
    console.log('Full response:');
    console.dir(eventsResponse, { depth: null });


    throw new Error(
      'Unexpected events response structure: search_events.list is missing.'
    );

  }


  console.log(
    `✅ Event list found. Number of records: ${events.length}`
  );


  // ============================================================== 
  // PRINT EVERY EVENT
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🔬 RAW EVENT-BY-EVENT DEBUG');
  console.log('============================================================');


  events.forEach((event, index) => {

    console.log('');
    console.log(`📌 EVENT #${index + 1}`);
    console.log('------------------------------------------------------------');

    console.log('ID:', event.id);
    console.log('Title:', event.title);
    console.log('is_flashback:', event.is_flashback);
    console.log('can_be_activated:', event.can_be_activated);
    console.log('lock_type_info:', event.lock_type_info);

    console.log('FULL EVENT OBJECT:');
    console.dir(event, { depth: null });

  });


  // ============================================================== 
  // SEPARATE UNLOCKED / LOCKED EVENTS
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🔐 FILTERING FLASHBACK EVENTS');
  console.log('============================================================');


  const unlockedEvents = [];
  const lockedEvents = [];


  for (const event of events) {

    console.log('');
    console.log('🔎 Checking event:');
    console.log('   ID:', event.id);
    console.log('   Title:', event.title);
    console.log('   is_flashback:', event.is_flashback);
    console.log('   can_be_activated:', event.can_be_activated);


    // ------------------------------------------------------------
    // Check 1: is_flashback
    // ------------------------------------------------------------

    if (event.is_flashback !== true) {

      console.log(
        '   ⏭️ SKIPPED: is_flashback !== true'
      );

      continue;

    }


    console.log(
      '   ✅ is_flashback === true'
    );


    // ------------------------------------------------------------
    // Check 2: can_be_activated
    // ------------------------------------------------------------

    if (event.can_be_activated === true) {

      console.log(
        '   🟢 UNLOCKED: can_be_activated === true'
      );

      unlockedEvents.push({
        id: event.id,
        title: event.title
      });

    } else {

      console.log(
        '   🔒 LOCKED: can_be_activated !== true'
      );

      console.log(
        '   🔒 Lock reason:',
        event.lock_type_info
      );

      lockedEvents.push({
        id: event.id,
        title: event.title,
        lockReason: event.lock_type_info
      });

    }

  }


  // ============================================================== 
  // FILTER RESULTS
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('📊 FILTER RESULTS');
  console.log('============================================================');

  console.log(
    '🟢 Unlocked Gifts flashbacks:',
    unlockedEvents.length
  );

  console.dir(
    unlockedEvents,
    { depth: null }
  );


  console.log(
    '🔒 Locked Gifts flashbacks:',
    lockedEvents.length
  );

  console.dir(
    lockedEvents,
    { depth: null }
  );


  // ============================================================== 
  // NO UNLOCKED EVENTS
  // ==============================================================

  if (unlockedEvents.length === 0) {

    console.log('');
    console.log('🎁 No unlocked Gifts flashback events.');
    console.log('🛑 Nothing will be activated.');
    console.log('============================================================');

    return;

  }


  // ============================================================== 
  // STEP 6
  // 🎯 RANDOMLY CHOOSE ONE
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🎯 STEP 6: Selecting random unlocked event');
  console.log('============================================================');


  console.log(
    '🟢 Number of unlocked events:',
    unlockedEvents.length
  );


  const randomIndex = Math.floor(
    Math.random() * unlockedEvents.length
  );


  console.log(
    '🎲 Random index selected:',
    randomIndex
  );


  const selectedEvent = unlockedEvents[randomIndex];


  console.log('');
  console.log('🎯 SELECTED EVENT:');
  console.log('   ID:', selectedEvent.id);
  console.log('   Title:', selectedEvent.title);


  // ============================================================== 
  // ACTIVATE EVENT
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🚀 ACTIVATING GIFTS FLASHBACK');
  console.log('============================================================');

  console.log(
    '🎯 Event ID being sent:',
    selectedEvent.id
  );

  console.log(
    '🎯 Event title:',
    selectedEvent.title
  );

  console.log('');
  console.log('📡 POST /ajax/events.php');
  console.log('📦 type = activateEvent');
  console.log('📦 event_id =', String(selectedEvent.id));


  let activationResponse;


  try {

    activationResponse = await page.evaluate(async (eventId) => {

      console.log(
        '[Browser] Starting activateEvent request...'
      );

      console.log(
        '[Browser] eventId:',
        eventId
      );


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


      console.log(
        '[Browser] activateEvent HTTP status:',
        response.status
      );

      console.log(
        '[Browser] activateEvent response OK:',
        response.ok
      );

      console.log(
        '[Browser] activateEvent response URL:',
        response.url
      );


      const text = await response.text();


      console.log(
        '[Browser] Raw activation response length:',
        text.length
      );

      console.log(
        '[Browser] Raw activation response:',
        text
      );


      let json;

      try {

        json = JSON.parse(text);

        console.log(
          '[Browser] Activation JSON parsed successfully.'
        );

      } catch (parseError) {

        console.log(
          '[Browser] ❌ ACTIVATION JSON PARSING FAILED'
        );

        console.log(
          '[Browser] Parse error:',
          parseError.message
        );

        throw parseError;

      }


      return json;

    }, selectedEvent.id);


    console.log('');
    console.log('📥 ACTIVATION RESPONSE RECEIVED:');
    console.dir(
      activationResponse,
      { depth: null }
    );


  } catch (error) {

    console.log('');
    console.log('❌❌❌ EVENT ACTIVATION REQUEST FAILED ❌❌❌');

    console.log('Error:', error);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);

    throw error;

  }


  // ============================================================== 
  // ACTIVATION RESULT
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🔎 CHECKING ACTIVATION RESULT');
  console.log('============================================================');

  console.log(
    'activationResponse.status =',
    activationResponse?.status
  );


  if (activationResponse?.status === 1) {

    console.log('');
    console.log('✅✅✅ GIFTS FLASHBACK ACTIVATED SUCCESSFULLY ✅✅✅');
    console.log(
      `🎁 Event: ${selectedEvent.title}`
    );
    console.log(
      `🆔 ID: ${selectedEvent.id}`
    );

  } else {

    console.log('');
    console.log('❌❌❌ EVENT ACTIVATION FAILED ❌❌❌');

    console.log(
      'Expected status: 1'
    );

    console.log(
      'Actual status:',
      activationResponse?.status
    );

    console.log('');
    console.log('FULL ACTIVATION RESPONSE:');

    console.dir(
      activationResponse,
      { depth: null }
    );


    throw new Error(
      `Failed to activate Gifts event "${selectedEvent.title}" (ID ${selectedEvent.id}). Server status: ${activationResponse?.status}`
    );

  }


  // ============================================================== 
  // FINISHED
  // ==============================================================

  console.log('');
  console.log('============================================================');
  console.log('🏁 APARTMENT + GIFTS SCRIPT FINISHED');
  console.log('🕐 Finished at:', new Date().toISOString());
  console.log('============================================================');
  console.log('');

};
