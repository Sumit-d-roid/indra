using Indra.Api.Contracts;

namespace Indra.Api.Services;

public interface IShadowModuleService
{
    FutureModuleResponse GetStatus();
}
