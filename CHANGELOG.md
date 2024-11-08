# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add new column for payment address

## [0.0.6] - 2024-11-08

### Added

- New column for item price margin
- Icon and tooltip aside discounts totalizer when there is a quotation discount in the cart

## [0.0.4] - 2024-11-07

### Fixed

- Possible null pointer on get valid payment system

## [0.0.3] - 2024-11-06

### Changed

- If selected payment is empty, set first payment system as selected
- Using checkout api endpoint for clear cart

## [0.0.2] - 2024-11-05

### Changed

- Fallback to window location on navigate usage

## [0.0.1] - 2024-10-28

### Added

- Add search items on product list
- Place order logic and redirect to native order placed screen
- Possibility of change payment method and shipping option
- Add checkout B2B permissions
- Add remove item button on product list
- Add quantity input on product list
- Add Brand column on products list
- Add SKU Reference column on products list
- Add Address information on totalizers
- Empty state of totalizers
- Page and route /checkout-b2b
- Initial release.
