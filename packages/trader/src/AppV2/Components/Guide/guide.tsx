import React from 'react';

import { LabelPairedPresentationScreenSmRegularIcon } from '@deriv/quill-icons';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { Button, Text } from '@deriv-com/quill-ui';

import useContractsForCompany from 'AppV2/Hooks/useContractsForCompany';
import { AVAILABLE_CONTRACTS, CONTRACT_LIST } from 'AppV2/Utils/trade-types-utils';
import { useTraderStore } from 'Stores/useTraderStores';

import { sendOpenGuideToAnalytics } from '../../../Analytics';

import GuideDefinitionModal from './guide-definition-modal';
import GuideDescriptionModal from './guide-description-modal';

type TGuide = {
    has_label?: boolean;
    is_open_by_default?: boolean;
    show_guide_for_selected_contract?: boolean;
    show_trigger_button?: boolean;
    show_description_in_a_modal?: boolean;
};

const Guide = observer(
    ({
        has_label,
        is_open_by_default,
        show_guide_for_selected_contract,
        show_trigger_button = true,
        show_description_in_a_modal = true,
    }: TGuide) => {
        const {
            ui: { is_dark_mode_on },
            common: { current_language },
        } = useStore();
        const { contract_type } = useTraderStore();
        const contract_type_title = AVAILABLE_CONTRACTS.find(item => item.for.includes(contract_type))?.id ?? '';
        const { trade_types } = useContractsForCompany();
        const order = [
            CONTRACT_LIST.RISE_FALL,
            CONTRACT_LIST.ACCUMULATORS,
            CONTRACT_LIST.MULTIPLIERS,
            CONTRACT_LIST.VANILLAS,
            CONTRACT_LIST.TURBOS,
            CONTRACT_LIST.HIGHER_LOWER,
            CONTRACT_LIST.TOUCH_NO_TOUCH,
            CONTRACT_LIST.MATCHES_DIFFERS,
            CONTRACT_LIST.EVEN_ODD,
            CONTRACT_LIST.OVER_UNDER,
        ];

        const filtered_contract_list = AVAILABLE_CONTRACTS.filter(contract =>
            trade_types.some((trade: { text?: string }) => trade.text === contract.id)
        );

        const ordered_contract_list = [...filtered_contract_list].sort(
            (a, b) => order.findIndex(item => item === a.id) - order.findIndex(item => item === b.id)
        );

        const [is_description_opened, setIsDescriptionOpened] = React.useState(is_open_by_default);
        const [selected_contract_type, setSelectedContractType] = React.useState(contract_type_title);
        const [selected_term, setSelectedTerm] = React.useState<string>('');

        const onChipSelect = React.useCallback((id: string) => setSelectedContractType(id ?? ''), []);

        const onClose = React.useCallback(() => setIsDescriptionOpened(false), []);

        React.useEffect(() => {
            if (show_guide_for_selected_contract) setSelectedContractType(contract_type_title);
        }, [show_guide_for_selected_contract, contract_type_title]);

        React.useEffect(() => {
            setIsDescriptionOpened(is_description_opened);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [is_open_by_default]);

        return (
            <React.Fragment>
                {show_trigger_button && (
                    <Button
                        color={is_dark_mode_on ? 'white' : 'black'}
                        icon={<LabelPairedPresentationScreenSmRegularIcon key='guide-button-icon' />}
                        onClick={() => {
                            sendOpenGuideToAnalytics(contract_type, 'main_trade_page');
                            setIsDescriptionOpened(true);
                        }}
                        variant={has_label ? 'secondary' : 'tertiary'}
                        key={current_language}
                    >
                        {has_label && (
                            <Text size='sm' bold color='quill-typography__color--prominent'>
                                <Localize i18n_default_text='Guide' />
                            </Text>
                        )}
                    </Button>
                )}
                <GuideDescriptionModal
                    contract_list={ordered_contract_list}
                    is_dark_mode_on={is_dark_mode_on}
                    is_open={is_description_opened}
                    onChipSelect={(id: string) => {
                        const selected_trade_type = ordered_contract_list.find(item => item.id === id);
                        sendOpenGuideToAnalytics(selected_trade_type?.for?.[0] ?? '', 'trade_type_page');
                        onChipSelect(id);
                    }}
                    onClose={onClose}
                    onTermClick={setSelectedTerm}
                    selected_contract_type={selected_contract_type}
                    show_guide_for_selected_contract={show_guide_for_selected_contract}
                    show_description_in_a_modal={show_description_in_a_modal}
                />
                <GuideDefinitionModal
                    contract_type={selected_contract_type}
                    term={selected_term}
                    onClose={() => setSelectedTerm('')}
                />
            </React.Fragment>
        );
    }
);

export default Guide;
