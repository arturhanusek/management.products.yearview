<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

        <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'>
        <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css'>
        <link rel="stylesheet" href="css/style.css">

    </head>
    <body>

        <div class="container">
            <div id="holder" class="row" ></div>
        </div>
<input type="hidden" id="allevent" value="{{json_encode($events)}}">
        <script type="text/tmpl" id="tmpl">
            @{{
            var colCount = 37,
                monthsCount = 12,
                date = date || new Date(),
                month = date.getMonth(),
                year = date.getFullYear(),
                first = new Date(year, month, 1),
                last = new Date(year, month + 1, 0),
                startingDay = first.getDay(),
                thedate = new Date(year, month, 1 - startingDay),
                dayclass = lastmonthcss,
                today = new Date(),
                startDate = first,
                i, j, activeCell;
            }}



            <table class="calendar-table table table-condensed table-tight">
                <thead>
                    <tr class="c-weeks">
                        <th class="c-name"></th>

                        @{{ for (i = 0; i < colCount; i++) { }}

                            <th class="c-name @{{: daycss[i % 7]}} ">
                                @{{: days[i % 7] }}
                            </th>

                        @{{ } }}

                    </tr>
                </thead>

                <tbody>

                    @{{ thedate = new Date(today.getFullYear(), today.getMonth(), 1); }}
                    @{{ for (j = 0; j < monthsCount; j++) { }}
                    <tr>

                        @{{
                            activeCell = false;
                            offset = thedate.getDay();
                            currentMonth = thedate.getMonth();
                        }}

                        <td class="calendar-day minw">
                            <div>
                                @{{: shortMonths[currentMonth]}}</br>@{{:thedate.getFullYear()}}
                            </div>
                        </td>

                        @{{ for (i = 0; i < colCount; i++) { }}

                        @{{
                            isThisMonth = thedate.getMonth() == currentMonth;
                            isCorrectDayOfWeek = thedate.getDay() == i % 7;
                            activeCell = isCorrectDayOfWeek && isThisMonth;
                        }}

                        <td class="calendar-day @{{: activeCell ? thedate.toDateCssClass():'' }} @{{: activeCell ? daycss[i % 7]:'outsideDate' }} js-cal-option" data-date="@{{: activeCell ? thedate.toISOString():'' }}">
                            <div class="date">
                                @{{: activeCell ? thedate.getDate():'' }}
                                @{{
                                    if(activeCell) {
                                        thedate.setDate(thedate.getDate() + 1);
                                    }
                                }}
                            </div>
                        </td>
                        @{{ } }}
                    </tr>
                    @{{ } }}
                </tbody>
            </table>

        </script>

        <script src='http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js'></script>
        <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js'></script>

        <script  src="js/index.js"></script>

    </body>
</html>
