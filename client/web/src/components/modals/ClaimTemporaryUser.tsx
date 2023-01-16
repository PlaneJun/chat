import { setUserJWT } from '@/utils/jwt-helper';
import { setGlobalUserLoginInfo } from '@/utils/user-helper';
import React from 'react';
import {
  claimTemporaryUser,
  t,
  useAppDispatch,
  useAsyncRequest,
  userActions,
} from 'tailchat-shared';
import {
  createMetaFormSchema,
  MetaFormFieldMeta,
  metaFormFieldSchema,
  WebMetaForm,
} from 'tailchat-design';
import { ModalWrapper } from '../Modal';

interface Values {
  email: string;
  password: string;
  [key: string]: unknown;
}

const fields: MetaFormFieldMeta[] = [
  { type: 'text', name: 'email', label: t('邮箱') },
  {
    type: 'password',
    name: 'password',
    label: t('密码'),
  },
];

const schema = createMetaFormSchema({
  email: metaFormFieldSchema
    .string()
    .required(t('邮箱不能为空'))
    .email(t('邮箱格式不正确')),
  password: metaFormFieldSchema
    .string()
    .min(6, t('密码不能低于6位'))
    .required(t('密码不能为空')),
});

interface ClaimTemporaryUserProps {
  userId: string;
  onSuccess?: () => void;
}
export const ClaimTemporaryUser: React.FC<ClaimTemporaryUserProps> = React.memo(
  (props) => {
    const userId = props.userId;
    const dispatch = useAppDispatch();

    const [{}, handleClaim] = useAsyncRequest(
      async (values: Values) => {
        const data = await claimTemporaryUser(
          userId,
          values.email,
          values.password
        );

        setGlobalUserLoginInfo(data);
        await setUserJWT(data.token);
        dispatch(userActions.setUserInfo(data));

        typeof props.onSuccess === 'function' && props.onSuccess();
      },
      [userId, props.onSuccess]
    );

    return (
      <ModalWrapper title={t('认领账号')}>
        <WebMetaForm schema={schema} fields={fields} onSubmit={handleClaim} />
      </ModalWrapper>
    );
  }
);
ClaimTemporaryUser.displayName = 'ClaimTemporaryUser';
