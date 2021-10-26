use super::*;

use phones::country::CA;
use phones::parse as parse_phone;

/// A `Phone` is a structrually valid phone number.
#[derive(Debug, Display, Clone, Hash, Into, Serialize, Deserialize, AsRef)]
pub struct Phone(String);

impl Phone {
    pub fn new(s: &str) -> Result<Self> {
        let phone = parse_phone(CA.into(), s)?;
        ensure!(phone.is_valid(), "invalid phone number");
        let phone = Phone(phone.format().to_string());
        Ok(phone)
    }

    delegate! {
        to self.0 {
            pub fn as_str(&self) -> &str;
        }
    }
}

impl AsRef<str> for Phone {
    delegate! {
        to self.0 {
            fn as_ref(&self) -> &str;
        }
    }
}

impl FromStr for Phone {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::new(s)
    }
}

impl From<Phone> for Bson {
    fn from(phone: Phone) -> Self {
        let Phone(s) = phone;
        s.into()
    }
}
