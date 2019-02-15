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
use Spatie\GoogleCalendar\GoogleCalendar;

Route::get('/', function () {

    $events = Event::get();

    $events[0]->startDate;
    $events[0]->startDateTime;
    $events[0]->endDate;
    $events[0]->endDateTime;
    return $events;
    return view('calendar');
});
