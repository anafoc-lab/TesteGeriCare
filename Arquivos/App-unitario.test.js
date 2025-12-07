import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import useAuthMock from './hooks/useAuthMock';
import useUsersMock from './hooks/useUsersMock';
import useResidents from './hooks/useResidents.mock';
import useItems from './hooks/useItems.mock';

import { AppDataContext } from './contexts/AppDataContext.mock';

const mockContext = {
  filial: { Id: 1 },
  usuario: { Id: 1, Nome: 'Admin' }
};

const wrapper = ({ children }) => (
  <AppDataContext.Provider value={mockContext}>
    {children}
  </AppDataContext.Provider>
);

describe('useAuthMock', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('login com CPF e senha corretos', async () => {
    const { result } = renderHook(() => useAuthMock());

    let response;

    await act(async () => {
      response = await result.current.loginWithPassword({
        login: '123.456.789-00',
        password: '123456'
      });
    });

    expect(response.success).toBe(true);
    expect(result.current.token).toBe('mock-bearer-token-123');
  });

  test('falha ao logar com senha incorreta', async () => {
    const { result } = renderHook(() => useAuthMock());

    let response;

    await act(async () => {
      response = await result.current.loginWithPassword({
        login: '123.456.789-00',
        password: 'errado'
      });
    });

    expect(response.success).toBe(false);
    expect(result.current.token).toBe(null);
  });

  test('logout remove token', () => {
    const { result } = renderHook(() => useAuthMock());

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('bearerToken')).toBe(null);
  });
});

describe('useUsersMock', () => {
  test('cria usuário', async () => {
    const { result } = renderHook(() => useUsersMock());

    await act(async () => {
      await result.current.createUser({
        cpf: '111.222.333-44',
        password: '123',
        name: 'Novo Usuário'
      });
    });

    expect(result.current.users.length).toBe(2);
  });

  test('atualiza usuário', async () => {
    const { result } = renderHook(() => useUsersMock());

    await act(async () => {
      await result.current.updateUser(1, {
        cpf: '999.999.999-99',
        password: '321',
        name: 'Atualizado'
      });
    });

    expect(result.current.users[0].name).toBe('Atualizado');
  });

  test('remove usuário', async () => {
    const { result } = renderHook(() => useUsersMock());

    await act(async () => {
      await result.current.deleteUser(1);
    });

    expect(result.current.users.length).toBe(0);
  });
});

describe('useResidents', () => {

  test('cria residente', async () => {
    const { result } = renderHook(() => useResidents(), { wrapper });

    await act(async () => {
      await result.current.createResident({ Nome: 'Carlos' });
    });

    expect(result.current.residents.length).toBe(3);
  });

  test('atualiza residente', async () => {
    const { result } = renderHook(() => useResidents(), { wrapper });

    await act(async () => {
      await result.current.updateResident(1, {
        Nome: 'José Atualizado'
      });
    });

    expect(result.current.residents[0].Nome).toBe('José Atualizado');
  });

  test('remove residente', async () => {
    const { result } = renderHook(() => useResidents(), { wrapper });

    await act(async () => {
      await result.current.deleteResident(1);
    });

    expect(result.current.residents.length).toBe(1);
  });
});

describe('useItems', () => {

  test('cria item', async () => {
    const { result } = renderHook(() => useItems(null, null, false), {
      wrapper
    });

    const initial = result.current.items.length;

    await act(async () => {
      await result.current.createItem({
        Nome: 'Item novo',
        Categoria: 1
      });
    });

    expect(result.current.items.length).toBe(initial + 1);
  });

  test('atualiza item', async () => {
    const { result } = renderHook(() => useItems(), { wrapper });

    const item = result.current.items[0];

    await act(async () => {
      await result.current.updateItem(item.Id, {
        ...item,
        Nome: 'Item editado'
      });
    });

    const alterado = result.current.items.find(i => i.Id === item.Id);

    expect(alterado.Nome).toBe('Item editado');
  });

  test('exclui item', async () => {
    const { result } = renderHook(() => useItems(), { wrapper });

    const item = result.current.items[0];

    await act(async () => {
      await result.current.deleteItem(item.Id);
    });

    const exists = result.current.items.find(i => i.Id === item.Id);

    expect(exists).toBeUndefined();
  });
});
