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

Route::get('/', function () {

    $calendar_id = Input::get('cid', 'en.irish#holiday@group.v.calendar.google.com');

    $events = Event::get(null,null,[], $calendar_id);

    return view('calendar', compact('events'));
});
