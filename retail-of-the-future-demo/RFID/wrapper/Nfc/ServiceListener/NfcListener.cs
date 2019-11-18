using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static NfcSupport.NfcUtils;
using Windows.Devices.SmartCards;
using Windows.Devices.Enumeration;
using Pcsc.Common;
using Pcsc;
using NfcSupport;

namespace ServiceListener
{
    public class NfcListener : ServicePointBase
    {
        public delegate void OnCardData(string cardUID);
        public event OnCardData CardDataEvent;

        OnCardData customEvent;
        SmartCardReader reader;
        bool isDetached = true;

        public async Task<bool> AttachReader(OnCardData onCardData)
        {
            isDetached = false;

            // check if we are already attached
            if (reader != null)
            {
                return true;
            }

            // check to see if we can get the reader
            var deviceInfo = await SmartCardReaderUtils.GetFirstSmartCardReaderInfo(SmartCardReaderKind.Nfc);

            if (deviceInfo == null || isDetached)
            {
                return false;
            }

            // instantiate reader
            reader = await SmartCardReader.FromIdAsync(deviceInfo.Id);

            if (!isDetached)  
            {
                reader.CardAdded += OnCardAdded;
                reader.CardRemoved += OnCardRemoved;

                customEvent = onCardData;
                CardDataEvent += customEvent;
            }

            return !isDetached;
        }

        public void DetachReader()
        {
            isDetached = true;
            customEvent = null;
            CardDataEvent = null;

            if (reader == null) return;

            reader.CardAdded -= OnCardAdded;
            reader.CardRemoved -= OnCardRemoved;

            reader = null;
        }

        private async void OnCardAdded(SmartCardReader sender, CardAddedEventArgs args)
        {
            await HandleCard(args.SmartCard);
        }


        private void OnCardRemoved(SmartCardReader sender, CardRemovedEventArgs args)
        {
            LogMessage("Card Removed");
        }
        private async Task HandleCard(SmartCard card)
        {
            try
            {
                string uid = string.Empty;

                // Connect to the card
                using (SmartCardConnection connection = await card.ConnectAsync())
                {
                    // Try to identify what type of card it was
                    IccDetection cardIdentification = new IccDetection(card, connection);
                    await cardIdentification.DetectCardTypeAync();
                    LogMessage("Connected to card\r\nPC/SC device class: " + cardIdentification.PcscDeviceClass.ToString());
                    LogMessage("Card name: " + cardIdentification.PcscCardName.ToString());
                    LogMessage("ATR: " + BitConverter.ToString(cardIdentification.Atr));

                    if ((cardIdentification.PcscDeviceClass == Pcsc.Common.DeviceClass.StorageClass) &&
                        (cardIdentification.PcscCardName == Pcsc.CardName.MifareUltralightC
                        || cardIdentification.PcscCardName == Pcsc.CardName.MifareUltralight
                        || cardIdentification.PcscCardName == Pcsc.CardName.MifareUltralightEV1))
                    {
                        // Handle MIFARE Ultralight
                        MifareUltralight.AccessHandler mifareULAccess = new MifareUltralight.AccessHandler(connection);

                        // Each read should get us 16 bytes/4 blocks, so doing
                        // 4 reads will get us all 64 bytes/16 blocks on the card
                        for (byte i = 0; i < 4; i++)
                        {
                            byte[] response = await mifareULAccess.ReadAsync((byte)(4 * i));
                            LogMessage("Block " + (4 * i).ToString() + " to Block " + (4 * i + 3).ToString() + " " + BitConverter.ToString(response));
                        }

                        byte[] responseUid = await mifareULAccess.GetUidAsync();
                        uid = BitConverter.ToString(responseUid);
                    }
                    else if (cardIdentification.PcscDeviceClass == Pcsc.Common.DeviceClass.MifareDesfire)
                    {
                        // Handle MIFARE DESfire
                        Desfire.AccessHandler desfireAccess = new Desfire.AccessHandler(connection);
                        Desfire.CardDetails desfire = await desfireAccess.ReadCardDetailsAsync();

                        LogMessage("DesFire Card Details:  " + Environment.NewLine + desfire.ToString());
                    }
                    else if (cardIdentification.PcscDeviceClass == Pcsc.Common.DeviceClass.StorageClass
                        && cardIdentification.PcscCardName == Pcsc.CardName.FeliCa)
                    {
                        // Handle Felica
                        LogMessage("Felica card detected");
                        var felicaAccess = new Felica.AccessHandler(connection);
                        var uidBits = await felicaAccess.GetUidAsync();
                        uid = BitConverter.ToString(uidBits);
                    }
                    else if (cardIdentification.PcscDeviceClass == Pcsc.Common.DeviceClass.StorageClass
                        && (cardIdentification.PcscCardName == Pcsc.CardName.MifareStandard1K || cardIdentification.PcscCardName == Pcsc.CardName.MifareStandard4K))
                    {
                        // Handle MIFARE Standard/Classic
                        LogMessage("MIFARE Standard/Classic card detected");
                        var mfStdAccess = new MifareStandard.AccessHandler(connection);
                        var uidBits = await mfStdAccess.GetUidAsync();
                        uid = BitConverter.ToString(uidBits);
                    }
                    else if (cardIdentification.PcscDeviceClass == Pcsc.Common.DeviceClass.StorageClass
                        && (cardIdentification.PcscCardName == Pcsc.CardName.ICODE1 ||
                            cardIdentification.PcscCardName == Pcsc.CardName.ICODESLI ||
                            cardIdentification.PcscCardName == Pcsc.CardName.iCodeSL2))
                    {
                        // Handle ISO15693
                        LogMessage("ISO15693 card detected");
                        var iso15693Access = new Iso15693.AccessHandler(connection);
                        var uidBits = await iso15693Access.GetUidAsync();
                        uid = BitConverter.ToString(uidBits);
                    }
                    else
                    {
                        // Unknown card type
                        // Note that when using the XDE emulator the card's ATR and type is not passed through, so we'll
                        // end up here even for known card types if using the XDE emulator

                        // Some cards might still let us query their UID with the PC/SC command, so let's try:
                        var apduRes = await connection.TransceiveAsync(new Pcsc.GetUid());
                        if (!apduRes.Succeeded)
                        {
                            LogMessage("Failure getting UID of card, " + apduRes.ToString());
                        }
                        else
                        {
                            uid = BitConverter.ToString(apduRes.ResponseData);
                        }
                    }
                }
                CardDataEvent?.Invoke(uid);
            }
            catch (Exception ex)
            {
                LogMessage("Exception handling card: " + ex.ToString(), NotifyType.ErrorMessage);
            }
        }
    }
}
