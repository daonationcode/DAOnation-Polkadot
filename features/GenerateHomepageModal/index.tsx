import { Button, IconButton, Modal } from '@heathmont/moon-core-tw';
import { ControlsClose, GenericLightningBolt, TextCards } from '@heathmont/moon-icons-tw';
import UseFormTextArea from '../../components/components/UseFormTextArea';
import EventTypeOption from '../../components/components/EventTypeOption';
import { useState } from 'react';
import Required from '../../components/components/Required';
import { generateTemplate } from '../../lib/services/openAIService';
import { toast } from 'react-toastify';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import { useRouter } from 'next/router';

export default function GenerateHomepageModal({ open, onClose }: { open: boolean; onClose }) {
  const [eventType, setEventType] = useState<'layout1' | 'layout2'>('layout1');

  const { api, showToast, userWalletPolkadot, userSigner } = usePolkadotContext();
  const router = useRouter();

  const [daoDescription, DaoDescriptionInput] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Add Description',
    id: '',
    rows: 4
  });

  async function generateHomepage() {
    const daoId = router.query.daoId;

    router.push(`${daoId}/design-dao`, { query: { daoId } });
    return;
    const template = await generateTemplate(daoDescription).then((res) => res.content);
    // const daoId = router.query.daoId;

    const toastId = toast.loading('Generating homepage...');

    await api._extrinsics.daos.updateTemplate(Number(daoId), template).signAndSend(userWalletPolkadot, { signer: userSigner }, (status) => {
      toast.update(toastId, { type: 'success', render: 'Homepage generated successfully!', autoClose: 1000, isLoading: false });
      router.push(`${daoId}/design-dao`, { query: { daoId } });
    });
  }

  const isInvalid = () => {
    return !daoDescription;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="min-w-[600px] bg-gohan">
        <div className="flex items-center justify-center flex-col">
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Generate homepage</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full max-h-[calc(90vh-162px)] p-6">
          <div className="flex flex-col gap-2">
            <h6>Purpose of your homepage</h6>
            <div className="flex gap-4">
              <EventTypeOption icon={<TextCards height={32} width={32} />} label="Predefined layout 1" selected={eventType === 'layout1'} onClick={() => setEventType('layout1')} />
              <EventTypeOption icon={<TextCards height={32} width={32} />} label="Predefined layout 2" selected={eventType === 'layout2'} onClick={() => setEventType('layout2')} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h6>
              Describe your charity <Required />
            </h6>
            {DaoDescriptionInput}
          </div>
        </div>
        <div className="flex justify-between border-t border-beerus w-full p-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button iconLeft={<GenericLightningBolt />} onClick={generateHomepage} disabled={isInvalid()}>
            Generate
          </Button>
        </div>
      </Modal.Panel>
    </Modal>
  );
}