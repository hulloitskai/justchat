#![allow(unused_imports)]

mod build;
pub use build::*;

mod handle;
pub use handle::*;

mod email;
pub use email::*;

mod phone;
pub use phone::*;

mod user;
pub use user::*;

mod message;
pub use message::*;

use entrust::Record;
use entrust::{AggregateOneQuery, AggregateQuery, MaybeAggregateOneQuery};
use entrust::{Comparison, SortingDirection};
use entrust::{EmptyConditions, EntityConditions};
use entrust::{EmptySorting, EntitySorting};
use entrust::{Entity, EntityContext, EntityId};
use entrust::{FindOneQuery, FindQuery, MaybeFindOneQuery};
use entrust::{Object, ObjectId};

use ::bson::DateTime as BsonDateTime;
use ::bson::{doc, from_document, to_document};
use ::bson::{Bson, Document};

use super::*;

use services::Services;

pub type Context<T = Services> = EntityContext<T>;
