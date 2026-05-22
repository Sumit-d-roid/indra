using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface ILabyrinthService
{
    FutureModuleResponse GetStatus();
}
