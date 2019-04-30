<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use Spatie\GoogleCalendar\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Collection;

Route::get('/', function () {

    $calendar_ids = explode(',', Input::get('cid', 'en.irish#holiday@group.v.calendar.google.com'));

    $colors = explode(',', Input::get('colors', '#FF4141,#00FF00,#F4A460,#F4A460,#F4A460,#F4A460,#F4A460'));

    $events = [];

    foreach ($calendar_ids as $calendar_id)
    {
        $calendar_events = Event::get(null,null,[], $calendar_id);

        foreach ($calendar_events as $calendar_event) {

            $events[] =[
                'title' => $calendar_event->googleEvent->summary,
                'start_date' =>  $calendar_event->googleEvent->start->date,
                'end_date' =>  $calendar_event->googleEvent->end->date,
                'color' =>  $colors[0]
            ];

        }

        array_shift($colors);
    }

    return view('calendar', compact('events'));

});
