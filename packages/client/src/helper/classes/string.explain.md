{skip} = new line
{newline} = new line
[COLOR:#ff0056=text] = text with the color #ff0056
[WEIGHT:700=text] = bold text (weight 700)
[BOLD=text] = bold text
[SEMIBOLD=text] = semi-bold text
[ITALIC=text] = italic text
[UNDERLINE=text] = underline text
[STRIKETHROUGH=text] = middle line text
[SHADOW:#ff0056 1px 1px 2px=text] = Text shadow text
[SIZE:20px=text] = custom size text
[BT1=value] = if (amount) is bigger than one
[BT0=value] = if (amount) is bigger than zero
[ST1=value] = if (amount) is smaller than one
[ST0=value] = if (amount) is smaller than zero
[UPC=value] = VALUE
[LOW=VALUE] = value
[REV=value] = eulav
[CAP=value] = Value
[NUMBER:2=amount] {currency} = 1,234.50 $
[PLURAL=message|messages] = messages (depends on amount)
[PLURAL:count=message|messages] = messages (depends on count)
[DATE:relative=createdAt] = 5mo ago
[DATE:time=createdAt] = 00:04:05
[DATE:datetime=createdAt] = 02/01/2026, 00:04:05
[DATE:iso=createdAt] = 2026-01-02T03:04:05.000Z
[DATE:date=createdAt] = 02/01/2026
[MAP:status=live:Online|offline:Offline|default:Unknown] = if status is live: Online; if is offline: Offline
[ESCAPE={message}] = html escaped text
[IF=vip && status === 'live'?VIP Online|Offline] = VIP online