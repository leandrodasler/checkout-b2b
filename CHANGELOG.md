# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.15] - 2024-11-25

### Fixed

- Handle empty organization trade name

## [0.0.14] - 2024-11-24

### Changed

- Show when billing address is same as shipping address

## [0.0.13] - 2024-11-24

### Changed

- Using cost center data

## [0.0.12] - 2024-11-20

### Fixed

- Word break style for totalizer values

## [0.0.11] - 2024-11-20

### Fixed

- Shipping address as last fallback

## [0.0.10] - 2024-11-20

### Added

- Using invoiceData of orderForm

## [0.0.9] - 2024-11-19

### Added

- New field for billing address
- Pending state for order placed button

## [0.0.8] - 2024-11-12

### Added

- Redirection to order placed with full page reload to update cart

## [0.0.7] - 2024-11-12

### Added

- Display organization users for the Sales Representative and Sales Admin roles

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
- Initial release
