# DigiByte URIs
Represents a digibyte payment URI. DigiByte URI strings became the most popular way to share payment request, sometimes as a digibyte link and others using a QR code.

URI Examples:

```
digibyte:DCXiSSQwi7gw9YXrMY4mxt2i4hQZEBb5Yv
digibyte:DCXiSSQwi7gw9YXrMY4mxt2i4hQZEBb5Yv?amount=1.2
digibyte:DCXiSSQwi7gw9YXrMY4mxt2i4hQZEBb5Yv?amount=1.2&message=Payment&label=Satoshi&extra=other-param
```

## URI Validation
The main use that we expect you'll have for the `URI` class in digibyte.js is validating and parsing digibyte URIs. A `URI` instance exposes the address as a digibyte.js `Address` object and the amount in Satoshis, if present.

The code for validating URIs looks like this:

```javascript
var uriString = 'digibyte:DCXiSSQwi7gw9YXrMY4mxt2i4hQZEBb5Yv?amount=1.2';
var valid = URI.isValid(uriString);
var uri = new URI(uriString);
console.log(uri.address.network, uri.amount); // 'livenet', 120000000
```

## URI Parameters
All standard parameters can be found as members of the `URI` instance. However a digibyte URI may contain other non-standard parameters, all those can be found under the `extra` namespace.

See [the official BIP21 spec](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) for more information.

## Create URI
Another important use case for the `URI` class is creating a digibyte URI for sharing a payment request. That can be accomplished by using a dictionary to create an instance of URI.

The code for creating an URI from an Object looks like this:

```javascript
var uriString = new URI({
  address: 'DCXiSSQwi7gw9YXrMY4mxt2i4hQZEBb5Yv',
  amount : 10000, // in satoshis
  message: 'My payment request'
});
var uriString = uri.toString();
```
