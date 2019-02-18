<?php

return [

    /*
     * Path to the json file containing the credentials.
     */
//    'service_account_credentials_json' => storage_path('app/google-calendar/service-account-credentials.json'),
    'service_account_credentials_json' => public_path('/sinuous-canto-231816-d2dc9cdd25a7.json'),

    /*
     *  The id of the Google Calendar that will be used by default.
     */
    'calendar_id' => env('GOOGLE_CALENDAR_ID'),
];
