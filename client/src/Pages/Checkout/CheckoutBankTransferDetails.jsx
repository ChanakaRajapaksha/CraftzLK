import {
  IoBusinessOutline,
  IoCardOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoPersonOutline,
} from "react-icons/io5";

function BankDetailItem({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="checkout-bank-details__item">
      <div className="checkout-bank-details__item-head">
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p>{value}</p>
    </div>
  );
}

export default function CheckoutBankTransferDetails({ bankTransfer, isOpen }) {
  const bankDetails = bankTransfer?.bankDetails || {};
  const hasBankDetails =
    bankDetails.bankName ||
    bankDetails.branchName ||
    bankDetails.accountNumber ||
    bankDetails.accountHolderName;

  return (
    <div
      className={`checkout-page__payment-detail${isOpen ? " checkout-page__payment-detail--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="checkout-page__payment-detail-inner">
        <div className="checkout-bank-details">
          <div className="checkout-bank-details__header">
            <IoBusinessOutline aria-hidden="true" />
            <div>
              <p className="checkout-bank-details__eyebrow">Direct bank transfer</p>
              <h4>Bank account details</h4>
            </div>
          </div>

          {hasBankDetails ? (
            <div className="checkout-bank-details__grid">
              <BankDetailItem icon={IoBusinessOutline} label="Bank name" value={bankDetails.bankName} />
              <BankDetailItem icon={IoLocationOutline} label="Branch name" value={bankDetails.branchName} />
              <BankDetailItem icon={IoCardOutline} label="Account no" value={bankDetails.accountNumber} />
              <BankDetailItem
                icon={IoPersonOutline}
                label="Account holder name"
                value={bankDetails.accountHolderName}
              />
            </div>
          ) : (
            <p className="checkout-bank-details__empty">
              Bank details are not configured yet. Please contact support to complete your transfer.
            </p>
          )}

          <div className="checkout-bank-details__note">
            <IoInformationCircleOutline aria-hidden="true" />
            <p>
              {bankTransfer?.description ||
                "Please transfer the total amount to the above account and use your order number as the payment reference."}
            </p>
          </div>

          <p className="checkout-bank-details__whatsapp">
            Send your payment slip with your order number to our WhatsApp{" "}
            <a href="https://wa.me/94715264449" target="_blank" rel="noreferrer">
              0715264449
            </a>
            . Your order will ship once the funds have cleared.
          </p>
        </div>
      </div>
    </div>
  );
}
