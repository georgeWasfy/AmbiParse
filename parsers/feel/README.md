# Function definition: only positional parameters supported
# NO InstanceOfExpression because no types for now

# FEEL Handbook

This is a vademecum for the FEEL (Friendly Enough Expression Language) from the DMN specification. It serves as a handy pocket reference, quick guide, reference, and cheatsheet for FEEL.

FEEL aims to be a common ground for business analysts, programmers, domain experts, and stakeholders.

Key features:

- Side-effect free
- Simple data model: numbers, dates, strings, lists, and contexts
- Simple syntax
- Three-valued logic (`true`, `false`, `null`)

The following sections present basic FEEL syntax and details of built-in and extended FEEL functions.

# FEEL Values

FEEL supports the following data types:

- Numbers
- Strings
- Boolean values
- Dates
- Time
- Date and time
- Days and time duration
- Years and months duration
- Functions
- Contexts
- Ranges (or intervals)
- Lists

## Number

Examples:

47
-9.123
1.2*10**3 // expression resulting in 1.2e3


Numbers in FEEL are based on the IEEE 754-2008 Decimal 128 format, with 34 digits of precision and are represented internally as `BigDecimals` with `MathContext DECIMAL128` in Java. Only one number data type exists for both integers and floating-point numbers.

FEEL uses a dot (`.`) as a decimal separator.  `-INF`, `+INF`, or `NaN` are not supported. `null` represents invalid numbers.

Literal scientific notation is not natively supported in FEEL. Use `1.2*10**3` instead of `1.2e3`.

**Drools DMN Extensions:**

-   **Scientific Notation:**  Use scientific notation with the suffix `e<exp>` or `E<exp>`. For example, `1.2e3` is the same as writing the expression `1.2*10**3`.
-   **Hexadecimal:**  Use hexadecimal numbers with the prefix `0x`. For example, `0xff` is the same as the decimal number `255`. Both uppercase and lowercase letters are supported (e.g., `0XFF` is the same as `0xff`).
-   **Type Suffixes:** The suffixes `f`, `F`, `d`, `D`, `l`, and `L` are supported but ignored.

## String

Example:

"John Doe"


Strings in FEEL are any sequence of characters delimited by double quotation marks.

## Boolean

Example:

true


FEEL uses three-valued boolean logic: `true`, `false`, or `null`.

## Date

Example:

date( "2017-06-23" )


Date literals are not supported. Use the built-in `date()` function to construct date values. Date strings follow the format `"YYYY-MM-DD"` as defined in the XML Schema Part 2: Datatypes document.

Date objects have a time equal to `"00:00:00"` (midnight) and are considered local, without a timezone.

**Semantic of date properties:**

date( "2022-12-31" ).year = 2022
date( "2022-12-31" ).month = 12
date( "2022-12-31" ).day = 31
date( "2017-11-08" ).weekday = 3


Access `year`, `month`, `day`, `weekday` properties on a `date` value.

## Time

Examples:

time( "04:25:12" )
time( "14:10:00+02:00" )
time( "22:35:40.345-05:00" )
time( "15:00:30z" )
time( "09:30:00@Europe/Rome" )


Time literals are not supported. Use the `time()` function to construct time values. Time strings follow the format `"hh:mm:ss[.uuu][(+-)hh:mm]"` as defined in the XML Schema Part 2: Datatypes document.

-   `hh`: Hour of the day (00 to 23)
-   `mm`: Minutes in the hour
-   `ss`: Seconds in the minute
-   `uuu`: (Optional) Milliseconds within the second
-   `(+-hh:mm)`: (Optional) Offset from UTC
-   `z`: Represents UTC time (same as offset of `-00:00`)
-   `@`: Followed by an IANA timezone.

If no offset is defined, the time is considered local. Time values with an offset or timezone cannot be compared to local times without an offset or timezone.

**Semantic of time properties:**

time( "13:20:00-05:00" ).hour = 13
time( "13:20:00-05:00" ).minute = 20
time( "13:20:00-05:00" ).second = 0
time( "13:20:00-05:00" ).time offset = duration("PT-5H")
time( "13:20:00@Europe/Rome" ).timezone = "Europe/Rome"
time( "13:20:00@Etc/UTC" ).timezone = "Etc/UTC"
time( "13:20:00@Etc/GMT" ).timezone = "Etc/GMT"


Access `hour`, `minute`, `second`, `time offset`, `timezone` properties.

## Date and Time

Examples:

date and time( "2017-10-22T23:59:00" )
date and time( "2017-06-13T14:10:00+02:00" )
date and time( "2017-02-05T22:35:40.345-05:00" )
date and time( "2017-06-13T15:00:30z" )
date and time( "2017-06-13T09:30:00@Europe/Rome" )


Date and time literals are not supported. Use the built-in `date and time()` function. Date and time strings follow the format `"<date>T<time>"` as defined in the XML Schema Part 2: Datatypes document.

**Semantic of date and time properties:**

date and time( "2016-07-29T05:48:23.765-05:00" ).year = 2016
date and time( "2016-07-29T05:48:23.765-05:00" ).month = 7
date and time( "2016-07-29T05:48:23.765-05:00" ).day = 29
date and time( "2016-07-29T05:48:23.765-05:00" ).weekday = 5
date and time( "2016-07-29T05:48:23.765-05:00" ).hour = 5
date and time( "2016-07-29T05:48:23.765-05:00" ).minute = 48
date and time( "2016-07-29T05:48:23.765-05:00" ).second = 23
date and time( "2016-07-29T05:48:23.765-05:00" ).time offset = duration("PT-5H")
date and time( "2018-12-10T10:30:00@Europe/Rome" ).timezone = "Europe/Rome"
date and time( "2018-12-10T10:30:00@Etc/UTC" ).timezone = "Etc/UTC"


Access `year`, `month`, `day`, `weekday`, `hour`, `minute`, `second`, `time offset`, `timezone` properties.

## Days and Time Duration

Examples:

duration( "P1DT23H12M30S" )
duration( "P23D" )
duration( "PT12H" )
duration( "PT35M" )
-duration( "P23D" )


Days and time duration literals are not supported. Use the `duration()` function. Days and time duration strings follow the format defined in the XML Schema Part 2: Datatypes document, but are restricted to days, hours, minutes and seconds. Months and years are not supported.

**Semantic of days and time duration properties:**

duration( "P2DT20H14M" ).days = 2
duration( "P2DT20H14M" ).hours = 20
duration( "P2DT20H14M" ).minutes = 14
duration( "P2DT20H14M5S" ).seconds = 5


Access `days`, `hours`, `minutes`, `seconds` properties.

## Years and Month Duration

Examples:

duration( "P3Y5M" )
duration( "P2Y" )
duration( "P10M" )
duration( "P25M" )
-duration( "P2Y" )


Years and month duration literals are not supported. Use the `duration()` function. Duration strings follow the format defined in the XML Schema Part 2: Datatypes document, but are restricted to years and months. Days, hours, minutes, or seconds are not supported.

**Semantic of years and month duration properties:**

duration( "P1Y" ).years = 1
duration( "P1Y" ).months = 0


Access `years`, `months` properties.

## Function

Example:

function(a, b) a + b


FEEL has function literals (anonymous functions, lambda functions). The example creates a function that adds parameters `a` and `b` and returns the result.

## Context

Example:

{ x : 5, y : 3 }


FEEL has `context` literals, similar to maps in languages like Java. The example creates a context with entries `x` and `y`, representing a coordinate.

In DMN 1.2, you can also create contexts by defining an item definition with attributes and declaring a variable as having that item definition type.

The Drools DMN API supports DMN `ItemDefinition` structural types in a `DMNContext` represented in two ways:

-   **User-defined Java type**: A valid JavaBeans object defining properties and getters for each component in the DMN `ItemDefinition`. Use `@FEELProperty` for getters representing a component name that would result in an invalid Java identifier.
-   `java.util.Map` interface: The map needs to define appropriate entries with keys corresponding to the component name in the DMN `ItemDefinition`.

## Range (or Interval)

Example interval between 1 and 10, including the boundaries (a closed interval):

[ 1 .. 10 ]


Example interval between 1 hour and 12 hours, including the lower boundary but excluding the upper boundary:

[ duration("PT1H") .. duration("PT12H") )


Syntax:

The expression for the endpoint must return a comparable value, and the lower bound endpoint must be lower than the upper bound endpoint. Use ranges in decision tables or literal expressions.

Example:

x in [ 1 .. 100 ] // Returns true if x is between 1 and 100.


**Semantic of range properties:**

(1..10].start included = false
(1..10].start = 1
(1..10].end = 10
(1..10].end included = true


Access `start`, `end`, `start included`, `end included` properties.

## List

Example:

[ 2, 3, 4, 5 ]


FEEL has `list` literals. A `list` is a comma-separated list of values enclosed in square brackets.

Examples to return the second element of a list `x`:

x


Example to return the second-to-last element of a list `x`:

x[-2]


Lists in FEEL contain elements of the same type and are immutable. Elements are accessed by index, starting from `1`. Negative indexes access elements from the end of the list, where `-1` is the last element.

The `count` function counts the number of elements in a list.

Example:

count([ 2, 3, 4, 5 ]) // Returns 4


## Properties of FEEL Values

For types `date and time`, `date`, `time`, `days and time duration`, `years and month duration`, or `range`, you can access the named components as follows:

-   `year`: Year number in the interval `[-999999999..999999999]`
-   `month`: Month number in the interval `[1..12]`, where `1` is January and `12` is December
-   `day`: Day of the month in the interval `[1..31]`
-   `hour`: Hour of the day in the interval `[0..23]`
-   `minute`: Minute of the hour in the interval `[0..59]`
-   `second`: Second of the minute in the interval `[0..60)`
-   `weekday`: Day of the week in the interval `[1..7]` where `1` is Monday and `7` is Sunday
-   `time offset`: Duration offset corresponding to the timezone; returns `null` if no time offset is set.
-   `timezone`: Timezone identifier as defined in the IANA Time Zones database; returns `null` if no IANA timezone is defined.
-   `years`: Years component of a `years and month duration`.
-   `months`: Months component of a `years and month duration` in the interval `[0..11]`.

