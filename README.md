# BubbleMap
d3.js packlayout in map

## Use
```javascript
var data = [
        {
            country: 'IN',
            name: 'Data-1',
            count: 5,
            color: 'pink'
        },
        {
            country: 'IN',
            name: 'Data-2',
            count: 12,
            color: 'blue'
        },
        {
            country: 'IN',
            name: 'Data-3',
            count: 8,
            color: 'green'
        },
        {
            country: 'IN',
            name: 'Data-4',
            count: 6,
            color: 'yellow'
        },
        {
            country: 'US',
            name: 'Data-1',
            count: 12,
            color: 'pink'
        },
        {
            country: 'US',
            name: 'Data-2',
            count: 15,
            color: 'blue'
        },
        {
            country: 'US',
            name: 'Data-3',
            count: 22,
            color: 'green'
        },
        {
            country: 'DE',
            name: 'Data-1',
            count: 12,
            color: 'pink'
        },
        {
            country: 'DE',
            name: 'Data-2',
            count: 15,
            color: 'blue'
        },
        {
            country: 'DE',
            name: 'Data-3',
            count: 22,
            color: 'green'
        }
    ];
    var elem = $('.map-component-view');
    new BubbleMap(data, elem, '100%', 960, 5, 10);
