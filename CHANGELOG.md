# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.49] - 2025-08-18

## [1.0.48] - 2025-08-18

## [1.0.47] - 2025-08-18

## [1.0.46] - 2025-08-18

## [1.0.45] - 2025-08-18

## [1.0.44] - 2025-08-14

## [1.0.43] - 2025-07-24

## [1.0.42] - 2025-07-21

## [1.0.41] - 2025-07-21

## [1.0.40] - 2025-07-17

## [1.0.39] - 2025-07-17

## [1.0.38] - 2025-07-17

- Group skus by product
- Allow multiple cost center orders if user has multiple cost centers

## [1.0.37] - 2025-06-16

## [1.0.36] - 2025-06-02

## [1.0.35] - 2025-06-02

## [1.0.34] - 2025-05-07

## [1.0.33] - 2025-04-28

## [1.0.32] - 2025-04-22

## [1.0.31] - 2025-04-16

## [1.0.30] - 2025-04-16

## [1.0.29] - 2025-04-07

## [1.0.28] - 2025-04-06

## [1.0.27] - 2025-04-06

## [1.0.26] - 2025-04-06

## [1.0.25] - 2025-04-06

## [1.0.24] - 2025-04-06

## [1.0.23] - 2025-04-04

## [1.0.22] - 2025-04-01

## [1.0.21] - 2025-04-01

## [1.0.20] - 2025-04-01

## [1.0.19] - 2025-03-31

## [1.0.18] - 2025-03-31

## [1.0.17] - 2025-03-31

## [1.0.16] - 2025-03-31

## [1.0.15] - 2025-03-26

## [1.0.14] - 2025-03-25

## [1.0.13] - 2025-03-20

## [1.0.12] - 2025-03-18

## [1.0.11] - 2025-03-18

## [1.0.10] - 2025-03-18

## [1.0.9] - 2025-03-17

## [1.0.8] - 2025-03-16

## [1.0.7] - 2025-03-14

## [1.0.6] - 2025-01-27

## [1.0.5] - 2025-01-27

## [1.0.4] - 2025-01-21

## [1.0.3] - 2025-01-21

### Fixed

- Correctly saved cart po number applying if empty

## [1.0.2] - 2025-01-20

### Added

- Saved carts transactions mechanism

## [1.0.1] - 2025-01-17

### Added

- Saved carts in a table

## [1.0.0] - 2025-01-07

### Added

- Manual pricing quotation by sales users

## [0.0.25] - 2024-12-26

### Added

- Add customer credit information on totalizers
- Node and graphql setup for saved carts
- Applying a saved cart on checkout

### Changed

- Putting showToast in CheckoutB2BContext and new hook useToast consuming it

## [0.0.21] - 2024-11-29

### Fixed

- Cost center default address as fallback for shipping address
- Keep total margin updated with order form

## [0.0.20] - 2024-11-27

### Fixed

- Fallback when margin is unavailable

## [0.0.19] - 2024-11-27

### Fixed

- Do not show toolbar when order form is loading

## [0.0.18] - 2024-11-27

### Added

- New totalizer for margin total
- Users with customer role can not view margin column or margin total

## [0.0.17] - 2024-11-25

### Changed

- Set client profile trade name with organization name if empty

## [0.0.16] - 2024-11-25

### Changed

- Change message for discount by quotation

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
